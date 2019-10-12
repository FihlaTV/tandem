// Copyright 2019, University of Colorado Boulder

/**
 * Provides a placeholder in the static API for where dynamic elements may be created.  Checks that members of the group
 * match the approved schema.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const arrayRemove = require( 'PHET_CORE/arrayRemove' );
  const Emitter = require( 'AXON/Emitter' );
  const GroupMemberTandem = require( 'TANDEM/GroupMemberTandem' );
  const phetioAPIValidation = require( 'TANDEM/phetioAPIValidation' );
  const PhetioObject = require( 'TANDEM/PhetioObject' );
  const Tandem = require( 'TANDEM/Tandem' );
  const tandemNamespace = require( 'TANDEM/tandemNamespace' );
  const validate = require( 'AXON/validate' );

  class Group extends PhetioObject {

    /**
     * @param {string} prefix - like "particle" or "person" or "electron", and will be suffixed like "particle_0"
     * @param {function} createMember - function that creates a group member
     * @param {Array.<*>|function.<[],Array.<*>>} defaultArguments arguments passed to create during API harvest
     * @param {Object} [options] - describe the Group itself
     */
    constructor( prefix, createMember, defaultArguments, options ) {

      assert && assert( typeof createMember === 'function', 'createMember should be a function' );
      assert && assert( Array.isArray( defaultArguments ) || typeof defaultArguments === 'function', 'defaultArguments should be an array or a function' );
      if ( Array.isArray( defaultArguments ) ) {
        assert && assert( createMember.length === defaultArguments.length + 1, 'mismatched number of arguments' ); // createMember also takes tandem
      }

      options = _.extend( {
        phetioState: false
      }, options );

      assert && assert( !!options.phetioType, 'phetioType must be supplied' );

      super( options );

      // @private
      this.createMember = createMember;

      // @public (read-only)
      this.array = [];

      // @private
      this.memberCreatedEmitter = new Emitter( { parameters: [ { isValidValue: _.stubTrue } ] } );
      this.memberDisposedEmitter = new Emitter( { parameters: [ { isValidValue: _.stubTrue } ] } );

      // @public (only for GroupIO) - for generating indices from a pool
      // TODO: This should be reset
      this.groupElementIndex = 0;

      // @private
      this.prefix = prefix;

      this.groupOptions = options;

      // When generating the baseline, output the schema for the prototype
      // TODO: (Maybe this, let's discuss more) instead of using phetioAPIValidation.enabled check here, in
      // TODO: phetioAPIValidation use the baseline.phetioTypeName for a whitelist of types that are only
      // TODO: instantiated dynamically.
      // TODO: Also look over in PhetioObject for the same pattern.
      if ( ( phet.phetio && phet.phetio.queryParameters.phetioPrintPhetioFiles ) || phetioAPIValidation.enabled ) {

        // TODO: support array or function but not both? samreid what do you think?
        const args = Array.isArray( defaultArguments ) ? defaultArguments : defaultArguments();
        assert && assert( createMember.length === args.length + 1, 'mismatched number of arguments' );

        // @private
        this.memberPrototype = createMember( this.tandem.createTandem( 'prototype' ), ...args );

        // {boolean} - hack alert! when printing the baseline, we need to keep track of prototype elements so they
        // appear in the baseline
        this.memberPrototype.isGroupMemberPrototype = true;
        assert && Group.assertDynamicPhetioObject( this.memberPrototype );
      }

      // There cannot be any items in the Group yet, and here we check for subsequently added items.
      assert && Tandem.PHET_IO_ENABLED && this.addMemberCreatedListener( Group.assertDynamicPhetioObject );
    }

    /**
     * @param {function} listener
     * @public
     */
    addMemberCreatedListener( listener ) {
      this.memberCreatedEmitter.addListener( listener );
    }

    /**
     * @param {function} listener
     * @public
     */
    removeMemberCreatedListener( listener ) {
      this.memberCreatedEmitter.removeListener( listener );
    }

    /**
     * @param {function} listener
     * @public
     */
    addMemberDisposedListener( listener ) {
      this.memberDisposedEmitter.addListener( listener );
    }

    /**
     * @param {function} listener
     * @public
     */
    removeMemberDisposedListener( listener ) {
      this.memberDisposedEmitter.removeListener( listener );
    }

    /**
     * remove an element from this Group, unregistering it from PhET-iO and disposing it.
     * @param member
     * @public
     */
    disposeGroupMember( member ) { // TODO: rename disposeMember
      arrayRemove( this.array, member );
      this.memberDisposedEmitter.emit( member );
      member.dispose();
    }

    /**
     * Get number of Group members
     * @returns {number}
     */
    get length() {
      return this.array.length;
    }

    /**
     * remove and dispose all registered group members
     * @public
     */
    clear() {
      while ( this.array.length > 0 ) {
        this.disposeGroupMember( this.array[ this.array.length - 1 ] );
      }

      this.groupElementIndex = 0;
    }

    /**
     * When creating a view element that corresponds to a specific model element, we match the tandem name index suffix
     * so that electron_0 corresponds to electronNode_0 and so on.
     * @param {PhetioObject} phetioObject
     * @param {...*} argsForCreateFunction - args to be passed to the create function, specified there are in the IO Type `stateObjectToArgs` method
     * @returns {PhetioObject}
     * @public
     */
    createCorrespondingGroupMember( phetioObject, ...argsForCreateFunction ) {
      const index = parseInt( phetioObject.tandem.name.split( phetio.PhetioIDUtils.GROUP_SEPARATOR )[ 1 ], 10 );

      // If the specified index overlapped with the next available index, bump it up so there is no collision on the
      // next createNextMember
      if ( this.groupElementIndex === index ) {
        this.groupElementIndex++;
      }
      return this.createGroupMember( index, argsForCreateFunction );
    }

    /**
     * Only for homogeneous Groups. Creates the next group member.
     * @param {...*} argsForCreateFunction - args to be passed to the create function, specified there are in the IO Type `stateObjectToArgs` method
     * @returns {PhetioObject}
     * @public
     */
    createNextMember( ...argsForCreateFunction ) {
      return this.createGroupMember( this.groupElementIndex++, argsForCreateFunction );
    }

    /**
     * @param {number} index - the number of the individual member
     * @param {Array.<*>} argsForCreateFunction
     * @returns {Object}
     * @public (GroupIO)
     */
    createGroupMember( index, argsForCreateFunction ) {
      assert && assert( Array.isArray( argsForCreateFunction ), 'should be array' );

      const componentName = this.prefix + phetio.PhetioIDUtils.GROUP_SEPARATOR + index;

      // create with default state and substructure, details will need to be set by setter methods.
      // TODO: discuss the api for the create method
      const groupMemberTandem = new GroupMemberTandem( this.tandem, componentName, this.tandem.getExtendedOptions( this.groupOptions ) );
      const groupMember = this.createMember( groupMemberTandem, ...argsForCreateFunction );

      // Make sure the new group member matches the schema for members.
      validate( groupMember, this.phetioType.parameterType.validator );

      this.array.push( groupMember );
      this.memberCreatedEmitter.emit( groupMember );

      return groupMember;
    }

    /**
     * A dynamic element should be an instrumented PhetioObject with phetioDynamicElement: true
     * @param {PhetioObject} phetioObject - object to be validated
     * @public
     * @static
     */
    static assertDynamicPhetioObject( phetioObject ) {
      assert && assert( phetioObject instanceof PhetioObject, 'instance should be a PhetioObject' );
      assert && assert( phetioObject.isPhetioInstrumented(), 'instance should be instrumented' );
      assert && assert( phetioObject.phetioDynamicElement, 'instance should be marked as phetioDynamicElement:true' );
    }
  }

  return tandemNamespace.register( 'Group', Group );
} );