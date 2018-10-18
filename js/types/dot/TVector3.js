// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var TObject = require( 'PHET_IO/types/TObject' );
  var assertInstanceOf = require( 'PHET_IO/assertions/assertInstanceOf' );

  /**
   * Wrapper type for phet/dot's Vector3
   * @param vector3
   * @param phetioID
   * @constructor
   */
  function TVector3( vector3, phetioID ) {
    assertInstanceOf( vector3, phet.dot.Vector3 );
    TObject.call( this, vector3, phetioID );
  }

  phetioInherit( TObject, 'TVector3', TVector3, {}, {
    documentation: 'Basic 3-dimensional vector, represented as (x,y,z)',

    /**
     * Decodes a state into a Vector3.
     * @param {Object} stateObject
     * @returns {Vector3}
     */
    fromStateObject: function( stateObject ) {
      return new phet.dot.Vector3( stateObject.x, stateObject.y, stateObject.z );
    },

    /**
     * Encodes a Vector3 instance to a state.
     * @param {Vector3} instance
     * @returns {Object}
     */
    toStateObject: function( instance ) {
      return { x: instance.x, y: instance.y, z: instance.z };
    }
  } );

  phetioNamespace.register( 'TVector3', TVector3 );

  return TVector3;
} );
