$(document).ready(function () {
    // Add smooth scrolling to all links
    $("a").on("click", function (event) {
        // Make sure this.hash has a value before overriding default behavior
        if (this.hash !== "") {
            // Prevent default anchor click behavior
            event.preventDefault();

            // Store hash
            var hash = this.hash;

            // Using jQuery's animate() method to add smooth page scroll
            // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
            $("html, body").animate(
                {
                    scrollTop: $(hash).offset().top,
                },
                800,
                function () {
                    // Add hash (#) to URL when done scrolling (default click behavior)
                    window.location.hash = hash;
                }
            );
        } // End if
    });

    // New functionality for order form
    function openOrderForm(itemName, itemPrice) {
        $('#order-form').css('display', 'flex');
        $('#food-name').text(itemName);
        $('#food-price').text('$' + itemPrice);
        $('#item-name').val(itemName);
        $('#item-price').val(itemPrice);
    }

    function closeOrderForm() {
        $('#order-form').css('display', 'none');
    }

    // Example of how to use openOrderForm
    // This should be triggered when a user clicks on an "Order Now" button
    $('.order-btn').on('click', function() {
        var itemName = $(this).data('name');
        var itemPrice = $(this).data('price');
        openOrderForm(itemName, itemPrice);
    });

    // Close order form when close button is clicked
    $('.close').on('click', closeOrderForm);
});
