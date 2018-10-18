// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'PHET_IO/assertions/assertInstanceOf' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var TButton = require( 'PHET_IO/api/sun/buttons/TButton' );

  var TResetAllButton = phetioInherit( TButton, 'TResetAllButton', function( instance, phetioID ) {
    assertInstanceOf( instance, phet.sceneryPhet.ResetAllButton );
    TButton.call( this, instance, phetioID );
  }, {}, {
    documentation: 'The round (typically orange) button that restores the simulation screen to its initial state',
    events: TButton.events
  } );

  phetioNamespace.register( 'TResetAllButton', TResetAllButton );

  return TResetAllButton;
} );
