// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOfTypes = require( 'PHET_IO/assertions/assertInstanceOfTypes' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var TNode = require( 'PHET_IO/types/scenery/nodes/TNode' );
  var toEventOnEmit = require( 'PHET_IO/events/toEventOnEmit' );

  /**
   * Wrapper type for phet/sun's ToggleButton class.
   * @param {function} phetioValueType - phet-io type wrapper like TString, TNumber, etc.
   * @returns {*}
   * @constructor
   */
  function TToggleButton( phetioValueType ) {
    assert && assert( !!phetioValueType, 'phetioValueType must be specified' );
    var TToggleButtonImpl = function TToggleButtonImpl( toggleButton, phetioID ) {
      TNode.call( this, toggleButton, phetioID );
      assertInstanceOfTypes( toggleButton, [
        phet.sun.ToggleButton,
        phet.sceneryPhet.PlayPauseButton,
        phet.sun.RoundStickyToggleButton,
        phet.sun.RectangularToggleButton,
        phet.sun.RoundMomentaryButton
      ] );

      var model = toggleButton.toggleButtonModel || toggleButton.buttonModel;  // Handle BooleanRoundStickyToggleButton too

      // Both StickyToggleButtonModel and ToggleButtonModel send the args in this order: oldValue, newValue
      toEventOnEmit( model.startedCallbacksForToggledEmitter, model.endedCallbacksForToggledEmitter, 'user', phetioID, TToggleButton( phetioValueType ), 'toggled',
        function( oldValue, newValue ) {
          return {
            oldValue: phetioValueType.toStateObject( oldValue ),
            newValue: phetioValueType.toStateObject( newValue )
          };
        } );
    };
    return phetioInherit( TNode, 'TToggleButton', TToggleButtonImpl, {}, {
      documentation: 'A button that toggles state (in/out) when pressed',
      events: [ 'toggled' ]
    } );
  }

  phetioNamespace.register( 'TToggleButton', TToggleButton );

  return TToggleButton;
} );
