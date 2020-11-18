//----------------------------------------
// TYPE: Annotation Repeater
//----------------------------------------

jQuery(document).ready(function($){

	Sortable.create(simpleList, {
        handle: ".handle",
        animation: 100 
    });

	var showRemoveButton = function() {
		var removeRow = $( '.list-group .remove-row' );
		if ( $( '.list-group-item' ).length == 1 ) {
			removeRow.hide();
		} else {
			removeRow.show();
		}
	};

	showRemoveButton();

	$( '.add-row' ).click( function() {
		var clone = $( '.list-group-item:last' ).clone();
		
		clone.find('input' )[0].value = 0;
		clone.find('input' )[1].value = 0;
		clone.find('input' )[2].value = 0;

		clone.find('input' )[3].value = 0;
		clone.find('input' )[4].value = 0;
		clone.find('input' )[5].value = 0;

		clone.find('#eng-title' )[0].value = "empty";
		clone.find('#swe-title' )[0].value = "empty";
		
		clone.find("textarea")[0].value = "empty";
		clone.find("textarea")[1].value = "empty";


		$( clone ).insertAfter( $( '.list-group-item:last' ) );
		var newIndex = $( '.list-group-item' ).length - 1;

		//reindexing when new annotation is added
		$( '.list-group-item:last [name]' ).attr( 'name', function( index, name ) {
			return name.replace( /\d+/g, newIndex );
		} );

		showRemoveButton();
		return false;
	} );

	$( document ).on( 'click', '.remove-row', function() {
		// .on because we have multiple .remove-row classes
		$( this ).closest( '.list-group-item' ).remove();
		
		showRemoveButton();
		return false;
	} );
});


