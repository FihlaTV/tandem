// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var TNode = require( 'SCENERY/nodes/TNode' );

  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertions/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var phetioNamespace = require( 'ifphetio!PHET_IO/phetioNamespace' );
  var toEventOnEmit = require( 'ifphetio!PHET_IO/events/toEventOnEmit' );

  /**
   * Wrapper type for phet/scenery's BarrierRectangle
   * @param barrierRectangle
   * @param phetioID
   * @constructor
   */
  function TBarrierRectangle( barrierRectangle, phetioID ) {
    assertInstanceOf( barrierRectangle, phet.scenery.Rectangle );
    TNode.call( this, barrierRectangle, phetioID );

    toEventOnEmit( barrierRectangle.startedCallbacksForFiredEmitter,
      barrierRectangle.endedCallbacksForFiredEmitter,
      'user',
      phetioID,
      TBarrierRectangle,
      'fired' );
  }

  phetioInherit( TNode, 'TBarrierRectangle', TBarrierRectangle, {}, {
    documentation: 'Shown when a dialog is present, so that clicking on the invisible barrier rectangle will dismiss the dialog',
    events: [ 'fired' ]
  } );

  phetioNamespace.register( 'TBarrierRectangle', TBarrierRectangle );

  return TBarrierRectangle;
} );
