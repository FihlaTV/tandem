// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );

  // constants
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var TObject = require( 'PHET_IO/types/TObject' );

  var TBounds3 = phetioInherit( TObject, 'TBounds3', function( bounds3, phetioID ) {
    TObject.call( this, bounds3, phetioID );
    assert && assert( bounds3 instanceof phet.dot.Bounds3 );
  }, {}, {
    documentation: 'a 3-dimensional bounds (bounding box)',

    fromStateObject: function( stateObject ) {
      return new phet.dot.Bounds3(
        stateObject.minX, stateObject.minY, stateObject.minZ,
        stateObject.maxX, stateObject.maxY, stateObject.maxZ
      );
    },

    toStateObject: function( instance ) {
      return {
        minX: instance.minX,
        minY: instance.minY,
        minZ: instance.minZ,

        maxX: instance.maxX,
        maxY: instance.maxY,
        maxZ: instance.maxZ
      };
    }
  } );

  phetioNamespace.register( 'TBounds3', TBounds3 );

  return TBounds3;
} );
