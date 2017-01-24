// Copyright 2015, University of Colorado Boulder

/**
 * Tandem is a general instance registry that can be used to track creation/disposal of instances in PhET Simulations.
 * It is used for phetio.js instrumentation for PhET-iO support.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var tandemNamespace = require( 'TANDEM/tandemNamespace' );
  var toCamelCase = require( 'PHET_CORE/toCamelCase' );

  // text
  var packageString = require( 'text!REPOSITORY/package.json' );

  // constants
  var packageJSON = JSON.parse( packageString );

  // variables
  var launched = false;

  /**
   * @param {string} id - id as a string (or '' for a root id)
   * @param {Object} [options]
   * @constructor
   */
  function Tandem( id, options ) {

    options = _.extend( {
      static: false,
      tandemRequiredButNotSupplied: false, // When set to true, if there isn't a tandem supplied, it will fail out.
      enabled: true
    }, options );

    // @public (read-only)
    this.id = ( id !== undefined ) ? id : '';

    // @private (read-only)
    this.static = options.static;
    this.tandemRequiredButNotSupplied = options.tandemRequiredButNotSupplied;
    this.enabled = options.enabled;
  }

  var staticInstances = [];

  tandemNamespace.register( 'Tandem', Tandem );

  // Listeners that will be notified when items are registered/deregistered
  var instanceListeners = [];

  inherit( Object, Tandem, {

    // @public (read-only) permit checking whether something is probably a Tandem instance for error checking
    isTandem: true,

    /**
     * Adds an instance of any type.  For example, it could be an axon Property, scenery Node or Sun button.  Each
     * item should only be added to the registry once, but that is not enforced here in Tandem.  For PhET-iO, phet-io.js
     * enforces one entry per ID in phetio.addInstance
     *
     * This is used to register instances with PhET-iO.
     * @param {Object} instance - the instance to add
     * @param {function} type - the PhET-iO type function, such as TString or TProperty(TNumber('volts'))
     * @public
     */
    addInstance: function( instance, type ) {

      if ( window.phet && window.phet.chipper && phet.chipper.brand === 'phet-io' && this.enabled ) {

        assert && assert( !this.tandemRequiredButNotSupplied, 'Tandem was required but not supplied' );
        // TODO: support optional tandems
        // if(!options.tandem.isDefaultTandem || (isOptional && tandemSupplied))

        if ( !type ) {
          console.log( 'Missing type declaration for ' + this.id );
        }

        // ifphetio returns a no-op function, so to test whether a valid T wrapper type was passed, we search for the typeName
        assert && assert( type && type.typeName, 'type must be specified and have a typeName' );

        if ( this.static && !launched ) {
          staticInstances.push( { tandem: this, instance: instance, type: type } );
        }
        else {
          for ( var i = 0; i < instanceListeners.length; i++ ) {
            instanceListeners[ i ].addInstance( this.id, instance, type );
          }
        }
      }
    },

    /**
     * Removes an instance from the
     * @param {Object} instance - the instance to remove
     * @public
     */
    removeInstance: function( instance ) {

      // Only active when running as phet-io
      if ( phet.chipper.brand === 'phet-io' && this.enabled ) {
        for ( var i = 0; i < instanceListeners.length; i++ ) {
          instanceListeners[ i ].removeInstance( this.id, instance );
        }
      }
    },

    /**
     * Create a new Tandem by appending the given id
     * @param {string} id
     * @param {Object} [options]
     * @returns {Tandem}
     * @public
     */
    createTandem: function( id, options ) {

      // Make sure the id was provided
      assert && assert( typeof id === 'string' && id.length > 0, 'id must be defined' );

      var string = ( this.id.length > 0 ) ? ( this.id + '.' + id ) : id;

      // Any child of something static is also static
      options = _.extend( { static: this.static, enabled: this.enabled }, options );

      return new Tandem( string, options );
    },

    /**
     * Creates a group tandem for creating multiple indexed child tandems, such as:
     * sim.screen.model.electron_0
     * sim.screen.model.electron_1
     *
     * In this case, 'sim.screen.model.electron' is the group tandem id.
     *
     * Used for arrays, observable arrays, or when many elements of the same type are created and they do not otherwise
     * have unique identifiers.
     * @param id
     * @returns {GroupTandem}
     */
    createGroupTandem: function( id ) {

      // Unfortunately we must resort to globals here since loading through the namespace would create a cycle
      return new GroupTandem( this.id + '.' + id );
    },

    /**
     * Get the last part of the tandem (after the last .), used in Joist for creating button names dynamically based
     * on screen names
     * @return {string} the tail of the tandem
     */
    get tail() {
      assert && assert( this.id.indexOf( '.' ) >= 0, 'tandem ID does not have a tail' );

      var lastIndexOfDot = this.id.lastIndexOf( '.' );
      var tail = this.id.substring( lastIndexOfDot + 1 );
      assert && assert( tail.length > 0, 'tandem ID did not have a tail' );
      return tail;
    },

    /**
     * Returns a Tandem for everything except the tail.
     * @returns {Tandem}
     */
    get parentTandem() {
      assert && assert( this.id.indexOf( '.' ) >= 0, 'tandem ID does not have a tail' );

      var lastIndexOfDot = this.id.lastIndexOf( '.' );
      var headID = this.id.substring( 0, lastIndexOfDot );

      return new Tandem( headID, {
        static: this.static,
        tandemRequiredButNotSupplied: this.tandemRequiredButNotSupplied,
        enabled: this.enabled
      } );
    },

    /**
     * When using subtyping, the instance listeners must only be notified once rather than once for every level
     * in the inheritance hierarchy.  When a subtype constructor has a tandem.addInstance call, it should
     * pass a supertype tandem to the parent constructor so that it won't try to register the item twice.
     * @returns {SupertypeTandem}
     */
    createSupertypeTandem: function() {
      return new SupertypeTandem( this.id );
    }
  }, {

    /**
     * Some common code (such as CheckBox or RadioButton) must always be instrumented and hence requires a tandem to be
     * passed in.  The options hash indicates this with {tandem: Tandem.tandemRequired()}
     * @returns {Tandem}
     */
    tandemRequired: function() {
      return rootTandem.createTandem( 'requiredTandem', { // TODO: for partially instrumented sims, should we add a numeric counter, like requiredTandem12
        tandemRequiredButNotSupplied: true // will be checked in addInstance
      } );
    },

    /**
     * Adds a listener that will be notified when items are registered/deregistered
     * Listeners have the form
     * {
     *   addInstance(id,instance),
     *   removeInstance(id,instance)
     * }
     * where id is of type {string} and instance is of type {Object}
     *
     * @param {Object} instanceListener - described above
     * @public
     * @static
     */
    addInstanceListener: function( instanceListener ) {
      instanceListeners.push( instanceListener );
    },

    /**
     * Create a tandem based on the name of the running simulation.
     * @returns {Tandem}
     */
    createRootTandem: function() {
      return new Tandem( toCamelCase( packageJSON.name ) );
    },

    /**
     * Create a child of the root tandem.
     * @param {string} name
     * @returns {Tandem}
     */
    createStaticTandem: function( name ) {
      return Tandem.createRootTandem().createTandem( name, { static: true } );
    },

    /**
     * When the simulation is launched, all static instances are registered.
     */
    launch: function() {
      assert && assert( !launched, 'Tandem was launched twice' );
      launched = true;
      while ( staticInstances.length > 0 ) {
        var staticInstance = staticInstances.shift();
        staticInstance.tandem.addInstance( staticInstance.instance, staticInstance.type );
      }
    },

    /**
     * When running as phet-io, User Interface components must be registered with tandem.  This function checks the
     * options to make sure tandem exists.  See https://github.com/phetsims/phet-io/issues/77
     * @param options
     */
    validateOptions: function( options ) {

      // Check to see whether the tandem is "filled in" as opposed to being a default Tandem.createOptionalTandem one.
      if ( window.phet && window.phet.chipper && phet.chipper.brand === 'phet-io' &&
           phet.phetio && phet.phetio.queryParameters && phet.phetio.queryParameters.phetioValidateTandems ) {
        assert && assert( options.tandem, 'tandem should be defined in common code components' );
        assert && assert( !options.tandem.tandemRequiredButNotSupplied, 'Default tandem instance cannot be used when running as PhET-iO' );
      }
    },

    /**
     * When running in PhET-iO brand, some code (such as user interface components) must be instrumented for PhET-iO.
     * Uninstrumented files should call this function to indicate they still need to be instrumented, so they aren't
     * missed.  See https://github.com/phetsims/phet-io/issues/668
     */
    indicateUninstrumentedCode: function() {
      if ( window.phet && window.phet.chipper && phet.chipper.brand === 'phet-io' &&
           phet.phetio && phet.phetio.queryParameters && phet.phetio.queryParameters.phetioValidateTandems ) {
        assert && assert( false, 'Uninstrumented code detected' );
      }
    }
  } );

  var rootTandem = Tandem.createRootTandem();

  // Tandem checks for listeners added before the Tandem module was loaded.  This is necessary so that phetio.js can
  // receive notifications about items created during static initialization such as Solute.js
  // which is created before Sim.js runs.
  if ( window.tandemPreloadInstanceListeners ) {
    for ( var i = 0; i < window.tandemPreloadInstanceListeners.length; i++ ) {
      Tandem.addInstanceListener( window.tandemPreloadInstanceListeners[ i ] );
    }
  }

  /**
   * @param {string} id - id as a string (or '' for a root id)
   * @constructor
   * @private create with Tandem.createGroupTandem
   * Declared in the same file to avoid circular reference errors in module loading.
   */
  function GroupTandem( id ) {

    Tandem.call( this, id );

    // @private for generating indices from a pool
    this.groupElementIndex = 0;
  }

  tandemNamespace.register( 'Tandem.GroupTandem', GroupTandem );

  inherit( Tandem, GroupTandem, {

    createNextTandem: function() {
      return new Tandem( this.id + '_' + ( this.groupElementIndex++ ) );
    }
  } );

  /**
   * @param {string} id - id as a string (or '' for a root id)
   * @constructor
   * @private create with Tandem.createSupertypeTandem
   */
  function SupertypeTandem( id ) {
    Tandem.call( this, id );
  }

  tandemNamespace.register( 'Tandem.SupertypeTandem', SupertypeTandem );

  inherit( Tandem, SupertypeTandem, {

    // @public - Override to make no-op, see createSupertypeTandem
    addInstance: function( instance, type ) {},

    // @public - Override to make no-op, see createSupertypeTandem
    removeInstance: function( instance ) {}
  } );

  return Tandem;
} );

