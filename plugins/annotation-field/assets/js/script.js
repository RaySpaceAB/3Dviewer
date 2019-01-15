jQuery(function( $){
	//----------------------------------------
	// TYPE: Repeater
	//----------------------------------------

	var verifyItemsRepeater = function() {
		var removeRow = $( '.repeater .remove-row' );
		if ( $( '.repeater > .item' ).length == 1 ) {
			removeRow.hide();
		} else {
			removeRow.show();
		}
	};

	verifyItemsRepeater();

	$( '.repeater > .add-row' ).click( function() {
		var clone = $( '.repeater > .item:last' ).clone();
		clone.find( 'input' ).val( '' );

		clone[0].children[0].children[1].value = 0;
		clone[0].children[0].children[2].value = 0;
		clone[0].children[0].children[3].value = 0;

		clone[0].children[1].children[1].value = 0;
		clone[0].children[1].children[2].value = 0;
		clone[0].children[1].children[3].value = 0;

		clone[0].getElementsByTagName("textarea")[0].value = "empty";
		clone[0].getElementsByTagName("textarea")[1].value = "empty";
		clone[0].children[2].children[0].children[0].children[1].value = "empty";
		clone[0].children[2].children[1].children[0].children[1].value = "empty";

		clone[0].children[2].children[0].children[1].children[1].value = "empty";
		clone[0].children[2].children[0].children[1].children[1].value = "empty";

		$( clone ).insertBefore( $( this ) );
		var newIndex = $( '.repeater > .item' ).length - 1;

		$( '.repeater > .item:last [name]' ).attr( 'name', function( index, name ) {
			return name.replace( /\d+/g, newIndex );
		} );

		verifyItemsRepeater();
		return false;
	} );

	$( document ).on( 'click', '.repeater .remove-row', function() {
		var item = $( '.repeater > .item' );
		console.log("item: ", item.lenth);
		if ( item.length == 1 ) {
			item.find( 'input' ).val( '' );
		} else {
			$( this ).closest( '.item' ).remove();
		}
		verifyItemsRepeater();
		return false;
	} );

} );