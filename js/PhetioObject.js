// Copyright 2017-2019, University of Colorado Boulder

/**
 * Base type that provides PhET-iO features. An instrumented PhetioObject is referred to on the wrapper side/design side
 * as a "PhET-iO element".  Note that sims may have hundreds or thousands of PhetioObjects, so performance and memory
 * considerations are important.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const Enumeration = require( 'PHET_CORE/Enumeration' );
  const EnumerationIO = require( 'PHET_CORE/EnumerationIO' );
  const inherit = require( 'PHET_CORE/inherit' );
  const LinkedElementIO = require( 'TANDEM/LinkedElementIO' );
  const ObjectIO = require( 'TANDEM/types/ObjectIO' );
  const phetioAPIValidation = require( 'TANDEM/phetioAPIValidation' );
  const Tandem = require( 'TANDEM/Tandem' );
  const tandemNamespace = require( 'TANDEM/tandemNamespace' );

  // ifphetio
  const dataStream = require( 'ifphetio!PHET_IO/dataStream' );

  // constants
  const PHET_IO_ENABLED = Tandem.PHET_IO_ENABLED;
  const EventType = new Enumeration( [ 'USER', 'MODEL', 'WRAPPER' ] );

  // Indicates a high frequency message was skipped.
  const SKIPPING_HIGH_FREQUENCY_MESSAGE = -1;

  // Factor out to reduce memory footprint, see https://github.com/phetsims/tandem/issues/71
  const EMPTY_OBJECT = {};

  const DEFAULTS = {
    tandem: Tandem.optional,          // Subtypes can use `Tandem.tandemRequired` to require a named tandem passed in
    phetioType: ObjectIO,             // Defines API methods, events and serialization
    phetioDocumentation: '',          // Useful notes about an instrumented PhetioObject, shown in the PhET-iO Studio Wrapper
    phetioState: true,                // When true, includes the PhetioObject in the PhET-iO state
    phetioReadOnly: false,            // When true, you can only get values from the PhetioObject; no setting allowed.
    phetioEventType: EventType.MODEL, // Category of event type, can be overridden in phetioStartEvent options
    phetioHighFrequency: false,       // High frequency events such as mouse moves can be omitted from data stream, see ?phetioEmitHighFrequencyEvents and Client.launchSim option
    phetioPlayback: false,            // When true, emits events for data streams for playback, see handlePlaybackEvent.js
    phetioStudioControl: true,        // When true, Studio is allowed to create a control for this PhetioObject (if it knows how)
    phetioComponentOptions: null,     // For propagating phetio options to sub-components, see SUPPORTED_PHET_IO_COMPONENT_OPTIONS
    phetioFeatured: false,            // When true, this is categorized as an important "featured" element in Studio.
    phetioEventMetadata: null         // {Object} optional - delivered with each event, if specified. phetioPlayback is appended here, if true
  };

  // phetioComponentOptions can specify either (a) the name of the specific subcomponent to target or (b) use a key from
  // DEFAULTS to apply to all subcomponents
  const SUPPORTED_PHET_IO_COMPONENT_OPTIONS = _.keys( DEFAULTS ).concat( [

    // NodeIO
    'visibleProperty', 'pickableProperty', 'opacityProperty',

    // TextIO
    'textProperty'
  ] );

  const OPTIONS_KEYS = _.keys( DEFAULTS );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function PhetioObject( options ) {

    // @public (read-only) {Tandem} - assigned in initializePhetioObject - see docs at DEFAULTS declaration
    this.tandem = null;

    // @public (read-only) {IOType} - assigned in initializePhetioObject - see docs at DEFAULTS declaration
    this.phetioType = null;

    // @public (read-only) {boolean} - assigned in initializePhetioObject - see docs at DEFAULTS declaration
    this.phetioState = null;

    // @public (read-only) {boolean} - assigned in initializePhetioObject - see docs at DEFAULTS declaration
    this.phetioReadOnly = null;

    // @public (read-only) {string} - assigned in initializePhetioObject - see docs at DEFAULTS declaration
    this.phetioDocumentation = null;

    // @public (read-only) {Object} - assigned in initializePhetioObject - see docs at DEFAULTS declaration
    this.phetioWrapper = null;

    // @private {boolean} - track whether the object has been initialized.  This is necessary because initialization
    // can happen in the constructor or in a subsequent call to initializePhetioObject (to support scenery Node)
    this.phetioObjectInitialized = false;

    // @private {number|null} - tracks the indices of started messages so that dataStream can check that ends match starts
    this.phetioMessageStack = [];

    // @public (read-only) {boolean} - has it been disposed?
    this.isDisposed = false;

    // @private {EventType} - see docs at DEFAULTS declaration
    this.phetioEventType = null;

    // @private {boolean} - see docs at DEFAULTS declaration
    this.phetioHighFrequency = null;

    // @private {boolean} - see docs at DEFAULTS declaration
    this.phetioPlayback = null;

    // @private {boolean} - see docs at DEFAULTS declaration
    this.phetioStudioControl = null;

    // @private {boolean} - see docs at DEFAULTS declaration
    this.phetioFeatured = false;

    // @private {boolean} - ignoring overrides, whether the element is featured.  Used by LinkedElement
    this.phetioFeaturedBaseline = false;

    // @public {boolean} - ignoring overrides, whether the element is read-only.  Used by NodeIO
    this.phetioReadOnlyBaseline = false;

    // @private {Object|null}
    this.phetioEventMetadata = null;

    // @public {Object} - see docs at DEFAULTS declaration
    this.phetioComponentOptions = null;

    // @private {LinkedElement[]} - keep track of LinkedElements for disposal
    this.linkedElements = [];

    if ( options ) {
      this.initializePhetioObject( {}, options );
    }

    if ( assert ) {

      // Wrap the prototype dispose method with a check. NOTE: We will not catch devious cases where the dispose() is
      // overridden after the Node constructor (which may happen).
      const protoDispose = this.dispose;
      this.dispose = () => {
        assert && assert( !this.isDisposed, 'This PhetioObject has already been disposed, and cannot be disposed again' );
        protoDispose.call( this );
        assert && assert( this.isDisposed, 'PhetioObject.dispose() call is missing from an overridden dispose method' );
      };
    }
  }

  tandemNamespace.register( 'PhetioObject', PhetioObject );

  /**
   * Determine if any of the options keys are intended for PhetioObject. Semantically equivalent to
   * _.intersection( _.keys( options ), OPTIONS_KEYS ).length>0 but implemented imperatively to avoid memory or
   * performance issues.
   * @param {Object} options
   * @returns {boolean}
   */
  const specifiesPhetioObjectKey = options => {
    for ( const key in options ) {
      if ( options.hasOwnProperty( key ) ) {
        if ( OPTIONS_KEYS.indexOf( key ) >= 0 ) {
          return true;
        }
      }
    }
    return false;
  };

  // Since PhetioObject is extended with inherit (e.g., SCENERY/Node), this cannot be an ES6 class
  inherit( Object, PhetioObject, {

    /**
     * Like SCENERY/Node, PhetioObject can be configured during construction or later with a mutate call.
     *
     * @param {Object} baseOptions - only applied if options keys intersect OPTIONS_KEYS
     * @param {Object} options
     * @protected
     */
    initializePhetioObject: function( baseOptions, options ) {
      assert && assert( options, 'initializePhetioObject must be called with options' );

      const hasKey = specifiesPhetioObjectKey( options );

      if ( !hasKey ) {
        return; // no PhetioObject keys provided, perhaps they will be provided in a subsequent mutate call.
      }
      assert && assert( !this.phetioObjectInitialized, 'cannot initialize twice' );

      // TODO: Can/should this be moved to phetioAPIValidation?  If so, should it be guarded by phetioAPIValidation.enabled? see https://github.com/phetsims/phet-io/issues/1409
      assert && assert( options.tandem, 'Component was missing its tandem' );

      const phetioID = options.tandem.phetioID;
      assert && assert( phetioID, 'Component was missing its phetioID' );

      if ( assert && options.phetioType && PHET_IO_ENABLED ) {
        assert && assert( options.phetioType.documentation, 'There must be a documentation string for each IO Type.' );

        for ( const methodName in options.phetioType.methods ) {
          if ( options.phetioType.methods.hasOwnProperty( methodName ) ) {
            const method = options.phetioType.methods[ methodName ];

            if ( typeof method === 'function' ) {

              // This is a private function for internal phet-io mechanics, not for exporting over the API, so it doesn't
              // need to be checked.
            }
            else {
              const IOType = options.phetioType;

              // If you get one of these assertion errors, go to the IOType definition file and check its methods
              assert && assert( !!method.returnType, IOType.typeName + '.' + methodName + ' needs a returnType' );
              assert && assert( !!method.implementation, IOType.typeName + '.' + methodName + ' needs an implementation function' );
              assert && assert( !!method.parameterTypes, IOType.typeName + '.' + methodName + ' needs a parameterTypes array' );
              assert && assert( !!method.documentation, IOType.typeName + '.' + methodName + ' needs a documentation string' );
            }
          }
        }

        assert && assert( options.phetioType !== undefined, phetioID + ' missing type from phetio.api' );
        assert && assert( options.phetioType.typeName, 'no type name for ' + phetioID + '(may be missing type parameter)' );
        assert && assert( options.phetioType.typeName, 'type must be specified and have a typeName for ' + phetioID );
      }

      options = _.extend( {}, DEFAULTS, baseOptions, options );

      // Store the baseline value for using in LinkedElement
      this.phetioFeaturedBaseline = options.phetioFeatured;

      // Store the baseline value for use in NodeIO
      this.phetioReadOnlyBaseline = options.phetioReadOnly;

      assert && assert( typeof options.phetioDocumentation === 'string',
        'invalid phetioDocumentation: ' + options.phetioDocumentation
      );

      // This block is associated with validating the baseline api and filling in metadata specified in the elements
      // overrides API file. Even when validation is not enabled, overrides should still be applied.
      // TODO: Remove '~' check once TANDEM/Tandem.GroupTandem usages have been replaced, see https://github.com/phetsims/tandem/issues/87 and https://github.com/phetsims/phet-io/issues/1409
      if ( PHET_IO_ENABLED && options.tandem.supplied && phetioID.indexOf( '~' ) === -1 ) {

        // Validate code baseline metadata against baseline elements schema, guard behind assert for performance.
        // Should be called before setting overrides
        assert && phetioAPIValidation.onPhetioObjectPreOverrides( options.tandem, PhetioObject.getMetadata( options ) );

        // don't compare/api check if we are printing out a new baseline file
        if ( !phet.phetio.queryParameters.phetioPrintPhetioElementsBaseline ) {

          // Dynamic elements should compare to their "concrete" counterparts.
          const concretePhetioID = options.tandem.getConcretePhetioID();

          // Overrides are only defined for simulations, not for unit tests.  See https://github.com/phetsims/phet-io/issues/1461
          // Patch in the desired values from overrides, if any.
          if ( window.phet.phetio.phetioElementsOverrides ) {
            const overrides = window.phet.phetio.phetioElementsOverrides[ concretePhetioID ];
            if ( overrides ) {
              options = _.extend( {}, options, overrides );
            }
          }

          // if it is a linked element, adopt the same phetioFeatured as the target
          if ( options.linkedElement ) {
            options.phetioFeatured = options.linkedElement.phetioFeatured;
          }
        }
      }

      // Unpack options to properties
      this.tandem = options.tandem;
      this.phetioType = options.phetioType;
      this.phetioState = options.phetioState;
      this.phetioReadOnly = options.phetioReadOnly;
      this.phetioEventType = options.phetioEventType;
      this.phetioDocumentation = options.phetioDocumentation;
      this.phetioHighFrequency = options.phetioHighFrequency;
      this.phetioPlayback = options.phetioPlayback;
      this.phetioStudioControl = options.phetioStudioControl;
      this.phetioComponentOptions = options.phetioComponentOptions || EMPTY_OBJECT;
      this.phetioFeatured = options.phetioFeatured;
      this.phetioEventMetadata = options.phetioEventMetadata;

      // Make sure playback shows in the phetioEventMetadata
      if ( this.phetioPlayback ) {
        this.phetioEventMetadata = this.phetioEventMetadata || {};
        assert && assert( !this.phetioEventMetadata.hasOwnProperty( 'playback' ), 'phetioEventMetadata.playback should not already exist' );
        this.phetioEventMetadata.playback = true;
      }

      // validate phetioComponentOptions
      assert && _.keys( this.phetioComponentOptions ).forEach( option => {
        assert && assert( SUPPORTED_PHET_IO_COMPONENT_OPTIONS.indexOf( option ) >= 0, 'Unsupported phetioComponentOptions: ' + option );
      } );

      // Instantiate the wrapper instance which is used for PhET-iO communication
      if ( this.isPhetioInstrumented() ) {
        // this assertion should be enabled for new phet-io sim publications
        // TODO: are we really going to add phetioDocumentation to every PhetioObject?, see https://github.com/phetsims/phet-io/issues/1409
        // TODO: If so, this assertion should be elsewhere, see https://github.com/phetsims/phet-io/issues/1409
        // assert && assert( this.phetioDocumentation, 'phetioDocumentation is required for: ' + this.tandem.phetioID );
        this.phetioWrapper = new this.phetioType( this, this.tandem.phetioID );
      }
      this.tandem.addPhetioObject( this );
      this.phetioObjectInitialized = true;
    },

    /**
     * Start an event for the nested PhET-iO data stream.
     *
     * @param {string} event - the name of the event
     * @param {Object|function|null} [data] - data for the event, either an object, or a function that returns an object
     *                                      - this is transmitted over postMessage using the structured cloning algorithm
     *                                      - and hence cannot contain functions or other unclonable elements
     * @public
     */
    phetioStartEvent: function( event, data ) {
      assert && assert( this.phetioObjectInitialized, 'phetioObject should be initialized' );
      assert && assert( typeof event === 'string' );
      assert && data && assert( typeof data === 'object' || typeof data === 'function' );
      assert && assert( arguments.length === 1 || arguments.length === 2, 'Prevent usage of incorrect signature' );

      // Opt out of certain events if queryParameter override is provided
      if ( window.phet && window.phet.phetio ) {
        if ( !window.phet.phetio.queryParameters.phetioEmitHighFrequencyEvents && this.phetioHighFrequency ) {
          this.phetioMessageStack.push( SKIPPING_HIGH_FREQUENCY_MESSAGE );
          return;
        }
      }

      if ( this.isPhetioInstrumented() ) {

        // Only get the args if we are actually going to send the event.
        if ( typeof data === 'function' ) {
          data = data();
        }

        this.phetioMessageStack.push( dataStream.start( this.phetioEventType, this, event, data, this.phetioEventMetadata ) );
      }
    },

    /**
     * End an event on the nested PhET-iO data stream. It this object was disposed or dataStream.start was not called,
     * this is a no-op.
     * @public
     */
    phetioEndEvent: function() {

      const topMessageIndex = this.phetioMessageStack.pop();

      // The message was started as a high frequency event to be skipped, so the end is a no-op
      if ( topMessageIndex === SKIPPING_HIGH_FREQUENCY_MESSAGE ) {
        return;
      }

      if ( this.isPhetioInstrumented() ) {
        dataStream.end( topMessageIndex );
      }
    },

    /**
     * Just because a tandem is passed in doesn't mean that it is instrumented. A PhetioObject will only be instrumented
     * if:
     * (1) Running in PhET-iO mode
     * (2) The tandem that was passed in was "supplied". See Tandem.supplied for more info
     * @returns {boolean}
     * @public
     */
    isPhetioInstrumented: function() {
      return this.tandem && this.tandem.supplied && PHET_IO_ENABLED;
    },

    /**
     * This creates a one-way association between this PhetioObject and the specified element, which is rendered in
     * Studio as a "symbolic" link or hyperlink.
     * @param {PhetioObject} element - the target element.
     * @param {Object} [options]
     */
    addLinkedElement: function( element, options ) {
      assert && assert( element instanceof PhetioObject, 'element must be of type PhetioObject' );

      this.linkedElements.push( new LinkedElement( element, options ) );
    },

    /**
     * Unregisters from tandem when longer used.
     * @public
     */
    dispose: function() {
      const self = this;
      assert && assert( !this.isDisposed, 'PhetioObject can only be disposed once' );

      // In order to support the structured data stream, PhetioObjects must end the messages in the correct
      // sequence, without being interrupted by dispose() calls.  Therefore, we do not clear out any of the state
      // related to the endEvent.  Note this means it is acceptable (and expected) for endEvent() to be called on
      // disposed PhetioObjects.
      //
      // The phetioEvent stack should resolve by the next clock tick, so that's when we check it.
      assert && setTimeout( () => {
        assert && assert( self.phetioMessageStack.length === 0, 'phetioMessageStack should be clear' );
      }, 0 );

      if ( this.phetioObjectInitialized ) {
        this.tandem.removePhetioObject( this );
        this.phetioWrapper && this.phetioWrapper.dispose && this.phetioWrapper.dispose();
      }

      // Dispose LinkedElements
      this.linkedElements.forEach( linkedElement => linkedElement.dispose() );
      this.linkedElements.length = 0;

      this.isDisposed = true;
    }
  }, {

    /**
     * TODO: Documentation, see https://github.com/phetsims/phet-io/issues/1409
     * @public
     * @param {Object} defaults
     * @param {Object} options - mutated to included merged phetioComponentOptions
     */
    mergePhetioComponentOptions: function( defaults, options ) {
      if ( assert && options.phetioComponentOptions ) {
        assert( options.phetioComponentOptions instanceof Object );
        assert( !options.phetioComponentOptions.tandem, 'tandem not supported in phetioComponentOptions' );
        assert( !options.phetioComponentOptions.phetioType, 'phetioType not supported in phetioComponentOptions' );
        assert( !options.phetioComponentOptions.phetioEventType, 'phetioEventType not supported in phetioComponentOptions' );
      }
      options.phetioComponentOptions = _.merge( defaults, options.phetioComponentOptions );
    },

    /**
     * JSONifiable metadata that describes the nature of the PhetioObject.  We must be able to read this
     * for baseline (before object fully constructed we use object) and after fully constructed
     * which includes overrides.
     * @param {Object} object - used to get metadata keys
     * @returns {Object}
     * @public
     */
    getMetadata: function( object ) {
      return {
        phetioTypeName: object.phetioType.typeName,
        phetioDocumentation: object.phetioDocumentation,
        phetioState: object.phetioState,
        phetioReadOnly: object.phetioReadOnly,
        phetioEventType: EnumerationIO( EventType ).toStateObject( object.phetioEventType ).toLowerCase(), //TODO: https://github.com/phetsims/phet-io/issues/1427 and https://github.com/phetsims/phet-io/issues/1409
        phetioHighFrequency: object.phetioHighFrequency,
        phetioPlayback: object.phetioPlayback,
        phetioStudioControl: object.phetioStudioControl,
        phetioFeatured: object.phetioFeatured
      };
    },

    DEFAULT_OPTIONS: DEFAULTS, // the default options for the phet-io object
    EventType: EventType // enum for phetio event types
  } );

  /**
   * Internal class to avoid cyclic dependencies.
   * @private
   */
  class LinkedElement extends PhetioObject {

    /**
     * @param {Object} element
     * @param {Object} [options]
     */
    constructor( element, options ) {
      assert && assert( !!element, 'element should be defined' );
      assert && assert( element instanceof PhetioObject, 'element should be PhetioObject' );
      assert && assert( element.tandem, 'element should have a tandem' );

      super( _.extend( {
        phetioType: LinkedElementIO,

        // The baseline value for phetioFeatured matches the target element
        phetioFeatured: element.phetioFeaturedBaseline,

        // But the override for the target element applies to the LinkedElement
        linkedElement: element,

        phetioReadOnly: true // References cannot be changed
      }, options ) );

      // @public (read-only)
      this.element = element;
    }
  }

  return PhetioObject;
} );