// Copyright 2016, University of Colorado Boulder

/**
 * PhET-iO wrapper type for phet's DerivedProperty type.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'PHET_IO/assertions/assertInstanceOf' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var TFunctionWrapper = require( 'PHET_IO/types/TFunctionWrapper' );
  var TObject = require( 'PHET_IO/types/TObject' );
  var toEventOnEmit = require( 'PHET_IO/events/toEventOnEmit' );
  var TVoid = require( 'PHET_IO/types/TVoid' );

  /**
   * Parametric wrapper type constructor.  Given an value type, this function returns an appropriate DerivedProperty wrapper type.
   *
   * @param {function} phetioValueType - phet-io type wrapper like TString, TNumber, etc.
   * @returns {*}
   * @constructor
   */
  function TDerivedProperty( phetioValueType ) {
    assert && assert( !!phetioValueType, 'TDerivedProperty needs phetioValueType' );

    /**
     * This type constructor is parameterized based on the phetioValueType.
     *
     * @param property {DerivedProperty}
     * @param {string} phetioID - the full unique tandem name for the instance
     * @constructor
     */
    var TDerivedPropertyImpl = function TDerivedPropertyImpl( property, phetioID ) {
      TObject.call( this, property, phetioID );
      assertInstanceOf( property, phet.axon.DerivedProperty );

      toEventOnEmit(
        property.startedCallbacksForChangedEmitter,
        property.endedCallbacksForChangedEmitter,
        phetioID,
        TDerivedProperty( phetioValueType ),
        'changed',
        function( newValue, oldValue ) {
          return {
            oldValue: phetioValueType.toStateObject( oldValue ),
            newValue: phetioValueType.toStateObject( newValue )
          };
        } );
    };
    return phetioInherit( TObject, 'TDerivedProperty', TDerivedPropertyImpl, {

      getValue: {
        returnType: phetioValueType,
        parameterTypes: [],
        implementation: function() {
          return this.instance.get();
        },
        documentation: 'Gets the current value'
      },

      unlink: {
        returnType: TVoid,
        parameterTypes: [ TFunctionWrapper( TVoid, [ phetioValueType ] ) ],
        implementation: function( listener ) {
          this.instance.unlink( listener );
        },
        documentation: 'Removes a listener that was added with link'
      },

      link: {
        returnType: TVoid,
        parameterTypes: [ TFunctionWrapper( TVoid, [ phetioValueType ] ) ],
        implementation: function( listener ) {
          this.instance.link( listener );
        },
        documentation: 'Adds a listener which will receive notifications when the value changes and an immediate callback' +
                       ' with the current value upon linking.'
      }
    }, {
      documentation: 'Like TProperty, but not settable.  Instead it is derived from other TDerivedProperty or TProperty ' +
                     'instances',
      valueType: phetioValueType,
      events: [ 'changed' ],

      /**
       * Decodes a state into a DerivedProperty.
       * @param {Object} stateObject
       * @returns {Object}
       */
      fromStateObject: function( stateObject ) {
        return phetioValueType.fromStateObject( stateObject );
      },


      /**
       * Encodes a DerivedProperty instance to a state.
       * @param {Object} instance
       * @returns {Object}
       */
      toStateObject: function( instance ) {
        return phetioValueType.toStateObject( instance.value );
      }
    } );
  }

  phetioNamespace.register( 'TDerivedProperty', TDerivedProperty );

  return TDerivedProperty;
} );
