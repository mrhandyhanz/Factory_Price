// cart.js — for cart.html only

document.addEventListener('DOMContentLoaded', function () {
    // Select elements from the DOM
    const cartCountElement = document.querySelector('.cart-count'); // Element to display total item count in header
    const orderSummaryElement = document.querySelector('.order-summary'); // Container for the order summary details

    /**
     * Updates the cart item count displayed in the header.
     * Reads the 'cart' array from localStorage.
     */
    function updateCartCount() {
        const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        if (cartCountElement) {
            cartCountElement.textContent = cartItems.length;
        }
    }

    /**
     * Renders the order summary dynamically based on items in localStorage.
     * This function is responsible for:
     * 1. Retrieving cart data.
     * 2. Handling empty cart scenario.
     * 3. Generating HTML for each cart item.
     * 4. Calculating subtotal, tax, and total.
     * 5. Injecting the generated HTML into the order-summary container.
     * 6. Attaching the event listener to the "Complete Purchase" button.
     */
    function renderOrderSummary() {
        // Ensure the order summary container exists before proceeding
        if (!orderSummaryElement) {
            console.error("Order summary element (.order-summary) not found. Cannot render cart.");
            return;
        }

        // Retrieve cart data from localStorage
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        // Handle case where the cart is empty
        if (cart.length === 0) {
            orderSummaryElement.innerHTML = `
                <h2 class="summary-title text-2xl font-semibold mb-6">Order Summary</h2>
                <p class="text-gray-600 mb-4">Your cart is empty. Please add items from the products page.</p>
                <a href="index.html" class="btn bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full text-center inline-block">Continue Shopping</a>
            `;
            // Update cart count to 0 if it's empty
            updateCartCount();
            return; // Stop function execution
        }

        let itemsHTML = ''; // Accumulator for HTML of individual cart items
        let subtotal = 0;   // Accumulator for the subtotal

        // Loop through each item in the cart to build its HTML and calculate subtotal
        cart.forEach(item => {
            // Safely parse the price, removing non-numeric characters (like "UGX " or commas)
            const priceNum = parseFloat(String(item.price).replace(/[^0-9.]/g, ''));
            subtotal += priceNum; // Add item price to subtotal

            itemsHTML += `
                <div class="summary-item flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                    <span class="text-gray-800">${item.title} × 1</span>
                    <span class="font-semibold text-gray-900">UGX ${priceNum.toLocaleString()}</span>
                </div>
            `;
        });

        // Calculate tax (assuming 0% based on previous discussions/PHP)
        const tax = 0; // UGX 0.00
        // Calculate total, ensuring it's formatted to 2 decimal places for currency consistency
        const total = (subtotal + tax).toFixed(2);

        // Dynamically update the order summary section with all cart details
        orderSummaryElement.innerHTML = `
            <h2 class="summary-title text-2xl font-semibold mb-6">Order Summary</h2>
            <div class="summary-items-list mb-4">
                ${itemsHTML}
            </div>
            <div class="summary-detail flex justify-between py-2 border-t border-gray-300">
                <span class="text-gray-700">Subtotal</span>
                <span class="font-semibold text-gray-900">UGX ${subtotal.toLocaleString()}</span>
            </div>
            <div class="summary-detail flex justify-between py-2">
                <span class="text-gray-700">Shipping</span>
                <span class="font-semibold text-green-600">Free</span>
            </div>
            <div class="summary-detail flex justify-between py-2 border-b border-gray-300">
                <span class="text-gray-700">Tax</span>
                <span class="font-semibold text-gray-900">UGX ${tax.toLocaleString()}</span>
            </div>
            <div class="summary-total flex justify-between items-center py-4 text-xl font-bold">
                <span>Total</span>
                <span>UGX ${parseFloat(total).toLocaleString()}</span>
            </div>
            <button class="btn checkout-btn w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out">
                Complete Purchase
            </button>
            <div class="payment-icons flex justify-center space-x-4 mt-6">
                <div class="payment-icon text-gray-500 text-lg">VISA</div>
                <div class="payment-icon text-gray-500 text-lg">MC</div>
                <div class="payment-icon text-gray-500 text-lg">AMEX</div>
                <div class="payment-icon text-gray-500 text-lg">PP</div>
            </div>
        `;

        // IMPORTANT: Attach the event listener to the "Complete Purchase" button
        // AFTER it has been added to the DOM via innerHTML.
        const checkoutButton = orderSummaryElement.querySelector('.checkout-btn');
        if (checkoutButton) {
            checkoutButton.addEventListener('click', handleCheckout);
        } else {
            console.warn("Checkout button not found after rendering summary. Cannot attach event listener.");
        }
    }

    /**
     * Handles the checkout process when the "Complete Purchase" button is clicked.
     * 1. Gathers shipping information from form fields.
     * 2. Performs basic validation.
     * 3. Sends cart data, shipping info, and total to submit_order.php via Fetch API.
     * 4. Handles the server response (success/failure).
     * 5. Clears the cart and redirects on success.
     */
    async function handleCheckout() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        // Gather shipping information from form fields
        const shipping = {
            firstName: document.getElementById('first-name').value,
            lastName: document.getElementById('last-name').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            zip: document.getElementById('zip').value,
            country: document.getElementById('country').value,
        };

        // Basic client-side validation for required shipping fields
        if (!shipping.firstName || !shipping.email || !shipping.address || !shipping.city || !shipping.zip || !shipping.country) {
            alert('Please fill in all required shipping information fields.');
            return;
        }

        // Ensure cart is not empty before submitting
        if (cart.length === 0) {
            alert('Your cart is empty. Please add items before completing the purchase.');
            return;
        }

        // Recalculate total to ensure consistency and prevent tampering
        const subtotal = cart.reduce((sum, item) => {
            return sum + parseFloat(String(item.price).replace(/[^0-9.]/g, ''));
        }, 0);
        const tax = 0; // Still assuming no tax in Uganda
        const total = (subtotal + tax).toFixed(2); // Format to 2 decimal places for backend

        try {
            // Send the order data to the PHP backend
            const response = await fetch('submit_order.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cart: cart, // The array of cart items
                    shipping: shipping, // The shipping information object
                    total: total // The calculated total
                })
            });

            const data = await response.json(); // Parse the JSON response from PHP

            if (data.success) {
                // On successful order placement
                alert(`Order placed successfully! Your Order ID is ${data.order_id}`);
                localStorage.removeItem('cart'); // Clear the cart from localStorage
                updateCartCount(); // Update the header cart count
                window.location.href = 'index.html'; // Redirect to the home/products page
            } else {
                // Handle errors from the PHP script
                alert(`Failed to place order: ${data.error || 'Unknown error. Please try again.'}`);
            }
        } catch (err) {
            // Handle network or fetch-related errors
            console.error('Fetch error during checkout:', err);
            alert('A server error occurred. Please check your console for details.');
        }
    }

    // Initial calls when the DOM content is fully loaded
    updateCartCount();    // Set the initial cart count in the header
    renderOrderSummary(); // Render the cart summary details
});
