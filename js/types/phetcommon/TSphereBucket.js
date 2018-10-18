// Copyright 2017, University of Colorado Boulder

/**
 * wrapper type for SphereBucket
 * @author Sam Reid (PhET Interactive Simulations)
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'PHET_IO/assertions/assertInstanceOf' );
  var phetio = require( 'PHET_IO/phetio' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var TObject = require( 'PHET_IO/types/TObject' );

  /**
   * @param {SphereBucket} instance
   * @param {string} phetioID
   * @constructor
   */
  var TSphereBucket = function( instance, phetioID ) {
    TObject.call( this, instance, phetioID );
    assertInstanceOf( instance, phet.phetcommon.SphereBucket );
  };

  // helper function for retrieving the tandem for a particle
  function getParticleTandemID( particle ) {
    return particle.particleTandem.id;
  }

  phetioInherit( TObject, 'TSphereBucket', TSphereBucket, {}, {

    /**
     * create a description of the state that isn't automatically handled by the framework (e.g. Property instances)
     * @param {SphereBucket} instance
     */
    toStateObject: function( instance ) {
      return instance._particles.map( getParticleTandemID );
    },

    /**
     * @param {string[]} stateArray
     * @returns {Particle[]}
     */
    fromStateObject: function( stateArray ) {
      return stateArray.map( function( tandemID ) { return phetio.getInstance( tandemID ); } );
    },

    /**
     * @param {SphereBucket} instance
     * @param {Particle[]} particleArray
     */
    setValue: function( instance, particleArray ) {

      // remove all the particles from the observable arrays
      instance._particles.length = 0;

      // add back the particles
      particleArray.forEach( function( value ) { instance._particles.push( value ); } );
    }
  } );

  phetioNamespace.register( 'TSphereBucket', TSphereBucket );

  return TSphereBucket;
} );
