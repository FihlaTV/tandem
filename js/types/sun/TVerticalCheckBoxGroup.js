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
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var TNode = require( 'PHET_IO/types/scenery/nodes/TNode' );

  /**
   * Wrapper type for phet/sun's VerticalCheckBoxGroup class.
   * @param verticalCheckBoxGroup
   * @param phetioID
   * @constructor
   */
  function TVerticalCheckBoxGroup( verticalCheckBoxGroup, phetioID ) {
    TNode.call( this, verticalCheckBoxGroup, phetioID );
    assertInstanceOf( verticalCheckBoxGroup, phet.sun.VerticalCheckBoxGroup );
  }

  phetioInherit( TNode, 'TVerticalCheckBoxGroup', TVerticalCheckBoxGroup, {}, {
    documentation: 'A vertical group of checkboxes'
  } );

  phetioNamespace.register( 'TVerticalCheckBoxGroup', TVerticalCheckBoxGroup );

  return TVerticalCheckBoxGroup;
} );
