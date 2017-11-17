// Copyright 2016, University of Colorado Boulder

/**
 * PhET-iO wrapper type for JS's built-in Array type.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var ObjectIO = require( 'PHET_IO/types/ObjectIO' );

  /**
   * Parametric wrapper type constructor.  Given an element type, this function returns an appropriate array wrapper type.
   * @param {ObjectIO} elementType - wrapper type of the individual elements in the array. If loaded by phet (not phet-io)
   *                                    it will be the function returned by the 'ifphetio!' plugin.
   * @constructor
   */
  function ArrayIO( elementType ) {

    /**
     * This type constructor is parameterized based on the elementType.
     * @param {Object[]} array - the array to be wrapped
     * @param {string} phetioID - the full unique tandem name for the instance
     * @constructor
     */
    var ArrayIOImpl = function ArrayIOImpl( array, phetioID ) {
      assert && assert( Array.isArray( array ), 'ArrayIO should wrap array instances' );
      ObjectIO.call( this, array, phetioID );
    };
    return phetioInherit( ObjectIO, 'ArrayIO', ArrayIOImpl, {}, {
      documentation: 'A wrapper for the built-in JS array type, with the element type specified.',
      elementType: elementType,

      /**
       * Deserialize from a serialized state.
       * @param {Object} stateObject - from toStateObject
       * @returns {Object[]}
       */
      fromStateObject: function( stateObject ) {
        var array = [];
        for ( var i = 0; i < stateObject.length; i++ ) {
          array.push( elementType.fromStateObject( stateObject[ i ] ) );
        }
        return array;
      },

      /**
       * Serialize an array by serializing each element
       * @param {Object[]} array
       * @returns {Array}
       */
      toStateObject: function( array ) {
        assert && assert( Array.isArray( array ), 'ArrayIO should wrap array instances' );
        assert && assert( elementType.toStateObject, elementType.typeName + ' does not have a toStateObject method.');

        var json = [];
        for ( var i = 0; i < array.length; i++ ) {
          json.push( elementType.toStateObject( array[ i ] ) );
        }
        return json;
      },

      setValue: function( array, elements ) {
        assert && assert( Array.isArray( array ), 'ArrayIO should wrap array instances' );
        array.length = 0;
        array.push.apply( array, elements );
      }
    } );
  }

  phetioNamespace.register( 'ArrayIO', ArrayIO );

  return ArrayIO;
} );