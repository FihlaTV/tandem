// Copyright 2019, University of Colorado Boulder

/**
 * For PhET-iO, we must be able to validate the API in order to ensure we don't make breaking changes in future versions.
 * DynamicElement wraps a function that knows how to create a dynamic, or optional, PhetioObject.  When generating the
 * baseline file, or when we want to validate a simulation against the baseline file, the PhetioObject is eagerly created
 * so we can harvest its API.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const PhetioObject = require( 'TANDEM/PhetioObject' );
  const tandemNamespace = require( 'TANDEM/tandemNamespace' );

  class DynamicElement {

    /**
     * @param {function} creator takes arguments and returns a PhetioObject with phetioDynamicElement: true
     * @param {Object[]} [defaultArguments]
     */
    constructor( creator, ...defaultArguments ) {
      this.instance = null;
      this.creator = creator;

      if ( phet.phetio.queryParameters.phetioPrintPhetioFiles ) {
        this.getInstance( ...defaultArguments );
      }
    }

    /**
     * Returns the instance associated with this DynamicElement, creating it if necesasry.
     * @param {Object[]} [arguments] passed through to the function
     * @returns {PhetioObject}
     * @public
     */
    getInstance() {
      this.instance = this.instance || this.creator.apply( null, arguments );
      assert && assert( this.instance instanceof PhetioObject, 'instance should be instrumented' );
      assert && assert( this.instance.phetioDynamicElement, 'instance should be marked as phetioDynamicElement:true' );
      return this.instance;
    }
  }

  return tandemNamespace.register( 'DynamicElement', DynamicElement );
} );