// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'PHET_IO/assertions/assertInstanceOf' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var TNode = require( 'PHET_IO/types/scenery/nodes/TNode' );
  var toEventOnEmit = require( 'PHET_IO/events/toEventOnEmit' );


  /**
   * Wrapper type for phet/sun's ComboBox class.
   * @param {function} phetioValueType - phet-io type wrapper like TString, TNumber, etc.
   * @returns {*}
   * @constructor
   */
  function TComboBoxItemNode( phetioValueType ) {
    assert && assert( !!phetioValueType, 'phetioValueType should be defined' );

    /**
     *
     * @param comboBoxItemNode
     * @param phetioID
     * @constructor
     */
    var TComboBoxItemNodeImpl = function TComboBoxImpl( comboBoxItemNode, phetioID ) {
      assertInstanceOf( comboBoxItemNode, phet.sun.ComboBox.ItemNode );
      TNode.call( this, comboBoxItemNode, phetioID );

      toEventOnEmit( comboBoxItemNode.startedCallbacksForItemFiredEmitter, comboBoxItemNode.endedCallbacksForItemFiredEmitter, 'user', phetioID, TComboBoxItemNode( phetioValueType ), 'fired', function( selection ) {
        return { value: phetioValueType.toStateObject( selection ) };
      } );
    };
    return phetioInherit( TNode, 'TComboBoxItemNode', TComboBoxItemNodeImpl, {}, {
      documentation: 'A traditional item node for a combo box',
      events: [ 'fired' ]
    } );
  }

  phetioNamespace.register( 'TComboBoxItemNode', TComboBoxItemNode );

  return TComboBoxItemNode;

} );