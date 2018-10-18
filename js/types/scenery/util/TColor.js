// Copyright 2016, University of Colorado Boulder

/**
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
  var TObject = require( 'PHET_IO/types/TObject' );

  /**
   * Wrapper type for phet/scenery's Color class.
   * @param color
   * @param phetioID
   * @constructor
   */
  function TColor( color, phetioID ) {
    TObject.call( this, color, phetioID );
    assertInstanceOf( color, phet.scenery.Color );
  }

  phetioInherit( TObject, 'TColor', TColor, {}, {
    documentation: 'A color, with rgba',

    /**
     * Decodes a state into a Color.
     * Use stateObject as the Font constructor's options argument
     * @param {Object} stateObject
     * @returns {Color}
     */
    fromStateObject: function( stateObject ) {
      return new phet.scenery.Color( stateObject.r, stateObject.g, stateObject.b, stateObject.a );
    },

    /**
     * Encodes a Color into a state object.
     * @param {Color} color
     * @returns {Object}
     */
    toStateObject: function( color ) {
      return color.toStateObject();
    }
  } );

  phetioNamespace.register( 'TColor', TColor );

  return TColor;
} );
