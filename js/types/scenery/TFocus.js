// Copyright 2016, University of Colorado Boulder

/**
 * Wrapper type for scenery's Focus region.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'PHET_IO/assertions/assertInstanceOf' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var toEventOnEmit = require( 'PHET_IO/events/toEventOnEmit' );
  var TObject = require( 'PHET_IO/types/TObject' );

  /**
   * Wrapper type for phet/sun's Faucet class.
   * @param {Object} focus - the focus region which has {display,trail}
   * @param {string} phetioID - the unique tandem assigned to the focus
   * @constructor
   */
  function TFocus( focus, phetioID ) {
    TObject.call( this, focus, phetioID );
    assertInstanceOf( focus, Object );
  }

  phetioInherit( TObject, 'TFocus', TFocus, {}, {

    /**
     * Convert the focus region to a plain JS object for serialization.
     * @param {Object} focus - the focus region which has {display,trail}
     * @returns {Object} - the serialized object
     */
    toStateObject: function( focus ) {

      // If nothing is focused, the focus is nulls
      if ( focus === null ) {
        return null;
      }
      else {
        return focus.trail.indices;
      }
    },

    /**
     * Convert the serialized instance back to a focus object
     * @param {number[]} indices
     * @returns {Object} with {display,trail}
     */
    fromStateObject: function( indices ) {

      if ( indices === null ) {

        // support unfocused
        return null;
      }
      else {

        // Follow the path of children based on their indices, starting from the root of the display.
        // There is always one more node in Trail than indices, representing the root node.
        var currentNode = phet.joist.sim.display.rootNode;
        var nodes = [ currentNode ];
        for ( var i = 0; i < indices.length; i++ ) {
          var index = indices[ i ];
          currentNode = currentNode.children[ index ];
          nodes.push( currentNode );
        }

        return { display: phet.joist.sim.display, trail: new phet.scenery.Trail( nodes ) };
      }
    }
  } );

  phetioNamespace.register( 'TFocus', TFocus );

  return TFocus;
} );