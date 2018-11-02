// Copyright 2016-2018, University of Colorado Boulder

/**
 * IO type use to signify a function has no return value.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var ObjectIO = require( 'TANDEM/types/ObjectIO' );
  var phetioInherit = require( 'TANDEM/phetioInherit' );
  var tandemNamespace = require( 'TANDEM/tandemNamespace' );

  /**
   * @constructor
   */
  function VoidIO() {
    assert && assert( false, 'should never be called' );
  }

  phetioInherit( ObjectIO, 'VoidIO', VoidIO,

    // Instance methods
    {},

    // Static methods
    {
      documentation: 'Type for which there is no instance, usually to mark functions without a return value',

      /**
       * @override
       * @public
       * @param {*} instance
       * @returns {boolean}
       */
      isInstance: function( instance ) { return instance === undefined; },

      toStateObject: function() {
        return undefined;
      }
    }
  );

  tandemNamespace.register( 'VoidIO', VoidIO );

  return VoidIO;
} );