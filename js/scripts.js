$(function () {

  // Globals variables

    //  An array containing objects with information about the products.
  var products = [],

    // Our filters object will contain an array of values for each filter

    // Example:
    // filters = {
    //    "manufacturer" = ["Apple","Sony"],
    //    "storage" = [16]
    //  }
    filters = {};
    
  //  Event handlers for frontend navigation

//  Checkbox filtering
  var checkboxes = $('#gallery-filter .filters input[type=checkbox]');  
  checkboxes.click(function () {
  	//$('.slider').foundation();
  	Foundation.reInit('slider');
    var that = $(this),
      specName = that.attr('name');

    // When a checkbox is checked we need to write that in the filters object;
    if(that.is(":checked")) {

      // If the filter for this specification isn't created yet - do it.
      if(!(filters[specName] && filters[specName].length)){
        filters[specName] = [];
      }

      //  Push values into the chosen filter array
      filters[specName].push(that.val());

      // Change the url hash;
      createQueryHash(filters);

    }

    // When a checkbox is unchecked we need to remove its value from the filters object.
    if(!that.is(":checked")) {

      if(filters[specName] && filters[specName].length && (filters[specName].indexOf(that.val()) != -1)){

        // Find the checkbox value in the corresponding array inside the filters object.
        var index = filters[specName].indexOf(that.val());

        // Remove it.
        filters[specName].splice(index, 1);

        // If it was the last remaining value for this specification,
        // delete the whole array.
        if(!filters[specName].length){
          delete filters[specName];
        }

      }

      // Change the url hash;
      createQueryHash(filters);
    }
  });

  // When the "Clear all filters" button is pressed change the hash to '#' (go to the home page)
  $('.filters button').click(function (e) {
    e.preventDefault();
    window.location.hash = '#';
  });


  // Single product page buttons

  var singleProductPage = $('.single-product');

  singleProductPage.on('click', function (e) {

    if (singleProductPage.hasClass('visible')) {

      var clicked = $(e.target);

      // If the close button or the background are clicked go to the previous page.
      if (clicked.hasClass('close') || clicked.hasClass('overlay')) {
        // Change the url hash with the last used filters.
        createQueryHash(filters);
      }

    }

  });

  $('.slider').on('moved.zf.slider', function(e, handle){
    var size = handle.attr('aria-valuenow'); 
    $(".product-name .cake-size").each(function(){
      $(this).text(size);
    });   
    $(".product-price").each(function(){
      var baseAmt=Number($(this).val());
      var calculatedAmt=baseAmt*(size-6);
      calculatedAmt = calculatedAmt==0?baseAmt:calculatedAmt;
      //$(this).siblings('b').children('span').text(calculatedAmt);
    });   
  });


  $.getJSON( "/products.json", function( data ) {
    // Get data about our products from products.json.
    products = data;
    // Call a function that will turn that data into HTML.
    generateAllProductsHTML(data);

    // Manually trigger a hashchange to start the app.
    $(window).trigger('hashchange');
  });


  $(window).on('hashchange', function(){
    // On every hash change the render function is called with the new hash.
    // This is how the navigation of our app happens.
    render(decodeURI(window.location.hash));
  });


function transform ( arr ) {
    var result = [], temp = [];
    arr.forEach( function ( elem, i ) {
        if ( i > 0 && i % 3 === 0 ) {
            result.push( temp );
            temp = [];
        }
        temp.push( elem );
    });
    if ( temp.length > 0 ) {
        result.push( temp );
    }
    return result;
}

function render(url) {

    // Get the keyword from the url.
    var temp = url.split('/')[0];

    // Hide whatever page is currently shown.
    $('.main-content .page').removeClass('visible');


    var map = {

      // The Homepage.
      '': function() {

        // Clear the filters object, uncheck all checkboxes, show all the products
        filters = {};
        checkboxes.prop('checked',false);

        renderProductsPage(products);
      },

      // Single Products page.
      '#product': function() {

        // Get the index of which product we want to show and call the appropriate function.
        var index = url.split('#product/')[1].trim();

        renderSingleProductPage(index, products);
      },

      // Page with filtered products
      '#filter': function() {

        // Grab the string after the '#filter/' keyword. Call the filtering function.
        url = url.split('#filter/')[1].trim();

        // Try and parse the filters object from the query string.
        try {
          filters = JSON.parse(url);
          filters.tags.sort();
        }
        // If it isn't a valid json, go back to homepage ( the rest of the code won't be executed ).
        catch(err) {
          window.location.hash = '#';
        }

        renderFilterResults(filters, products);
      }

    };

    // Execute the needed function depending on the url keyword (stored in temp).
    if(map[temp]){
      map[temp]();
    }
    // If the keyword isn't listed in the above - render the error page.
    else {
      renderErrorPage();
    }

  }


  function generateAllProductsHTML(data){

    var list = $('.all-products .products-list');

    var theTemplateScript = $("#products-template").html();
    //Compile the template​
    var theTemplate = Handlebars.compile (theTemplateScript);
    list.append (theTemplate(data));

    // Each products has a data-index attribute.
    // On click change the url hash to open up a preview for this product only.
    // Remember: every hashchange triggers the render function.
    list.find('.product-info').on('click', function (e) {
      e.preventDefault();

      var productIndex = $(this).data('index');

      window.location.hash = 'product/' + productIndex;
    });

	  list.find(".product-info").hover(
	    function() {
	      $(this).find(".product-photo").css("transform","matrix(1, 0, 0, 1, 0, -170)");	      
	      $(this).find(".product-desc-box").css("transform","matrix(1, 0, 0, 1, 0, -170)");
	      $(this).find(".product-desc").css("transform","matrix(1, 0, 0, 1, 0, -170)");
	      
	    },
	    function() {
	      $(this).find(".product-photo").css("transform","matrix(1, 0, 0, 1, 0, 0)");	      
	      $(this).find(".product-desc-box").css("transform","matrix(1, 0, 0, 1, 0, 0)");
	      $(this).find(".product-desc").css("transform","matrix(1, 0, 0, 1, 0, 0)");
	    }
	  );
  }


  function renderProductsPage(data){

      var page = $('.all-products'),
        allProducts = $('.all-products .products-list .grid');
        allProducts.remove();
      if(data.length>0){
        generateAllProductsHTML(data);
      }
  }

  function renderSingleProductPage(index, data){

      var page = $('.single-product'),
        container = $('.preview-large');

      // Find the wanted product by iterating the data object and searching for the chosen index.
      if(data.length){
        data.forEach(function (item) {
          if(item.id == index){
            // Populate '.preview-large' with the chosen product's data.
            container.find('h3').text(item.name);
            container.find('img').attr('src', item.image.large);
            container.find('p').text(item.description);
          }
        });
      }

      // Show the page.
      page.addClass('visible');

  }

  function renderFilterResults(filters, products){

        // This array contains all the possible filter criteria.
      var criteria = ['tags'],
        results = [],
        isFiltered = false;

      // Uncheck all the checkboxes.
      // We will be checking them again one by one.
      checkboxes.prop('checked', false);


      criteria.forEach(function (c) {

        // Check if each of the possible filter criteria is actually in the filters object.
        if(filters[c] && filters[c].length){


          // After we've filtered the products once, we want to keep filtering them.
          // That's why we make the object we search in (products) to equal the one with the results.
          // Then the results array is cleared, so it can be filled with the newly filtered data.
          if(isFiltered){
            products = results;
            results = [];
          }


          // In these nested 'for loops' we will iterate over the filters and the products
          // and check if they contain the same values (the ones we are filtering by).

          // Iterate over the entries inside filters.criteria (remember each criteria contains an array).
          filters[c].forEach(function (filter) {

            // Iterate over the products.
            products.forEach(function (item){

              // If the product has the same specification value as the one in the filter
              // push it inside the results array and mark the isFiltered flag true.
              var tags = item.tags;
              if(!$.isEmptyObject(tags) && $.inArray(filter,tags)>-1){
                  results.push(item);
                  isFiltered = true;                
              }

            });

            // Here we can make the checkboxes representing the filters true,
            // keeping the app up to date.
            if(c && filter){
              $('input[name='+c+'][value='+filter+']').prop('checked',true);
            }
          });
        }

      });

      // Call the renderProductsPage.
      // As it's argument give the object with filtered products.
      
      renderProductsPage(results);
    }

  function renderErrorPage(){
    var page = $('.error');
    page.addClass('visible');
  }
  
  function createQueryHash(filters){

      // Here we check if filters isn't empty.
      if(!$.isEmptyObject(filters)){
        // Stringify the object via JSON.stringify and write it after the '#filter' keyword.
        window.location.hash = '#filter/' + JSON.stringify(filters);
      }
      else{
        // If it's empty change the hash to '#' (the homepage).
        window.location.hash = '#';
      }

    }

});


