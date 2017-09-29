// Copyright 2016, University of Colorado Boulder

/**
 * PhET-iO wrapper type for JS's built-in string type.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var TObject = require( 'PHET_IO/types/TObject' );

  /**
   * @constructor
   */
  function TString() {
    assert && assert( false, 'should never be called' );
  }

  phetioInherit( TObject, 'TString', TString, {}, {
    documentation: 'Wrapper for the built-in JS string type',

    /**
     * Decode a string from a state, which is already a string.
     * @param {Object} stateObject
     * @returns {Object}
     */
    fromStateObject: function( stateObject ) {
      return stateObject;
    },

    /**
     * Encodes a string to a state (which also happens to be a string).
     * @param {Object} value
     * @returns {Object}
     */
    toStateObject: function( value ) {
      return value;
    }
  } );

  phetioNamespace.register( 'TString', TString );

  return TString;
} );