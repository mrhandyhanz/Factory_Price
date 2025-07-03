// products.js - Handles adding items to cart, updating cart count, and managing dropdown on the products page

document.addEventListener('DOMContentLoaded', () => {
    console.log('products.js: DOMContentLoaded fired.');

    // Element declarations with null checks
    const cartCountElement = document.getElementById('cart-count');
    const cartDropdown = document.getElementById('cart-dropdown');
    const dropdownCartItemsContainer = document.getElementById('dropdown-cart-items');
    const dropdownCartTotalElement = document.getElementById('dropdown-cart-total');
    const shoppingCartContainer = document.querySelector('.shopping-card-container');

    // Helper function to get cart with error handling
    function getCart() {
        try {
            return JSON.parse(localStorage.getItem('shoppingCart')) || [];
        } catch (e) {
            console.error('products.js: Error parsing cart data:', e);
            return [];
        }
    }

    // Function to update the cart count displayed in the header
    function updateCartCount() {
        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCountElement) {
            cartCountElement.textContent = totalItems;
            console.log(`products.js: Header cart count updated to: ${totalItems}`);
        } else {
            console.warn('products.js: Cart count element (#cart-count) not found in header.');
        }
    }
    
    // Function to populate and display the cart dropdown
    function populateCartDropdown() {
        console.log('products.js: populateCartDropdown function called.');
        const cart = getCart();
        console.log('products.js: Cart retrieved for dropdown:', cart);

        if (!dropdownCartItemsContainer) {
            console.error('products.js: Dropdown cart items container not found');
            return;
        }

        dropdownCartItemsContainer.innerHTML = ''; // Clear previous items
        let total = 0;

        if (cart.length === 0) {
            dropdownCartItemsContainer.innerHTML = '<p class="text-center text-gray-500 py-4">No items in cart.</p>';
            console.log('products.js: Cart is empty, setting empty message in dropdown.');
        } else {
            cart.forEach((item) => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                console.log(`products.js: Adding item to dropdown: ${item.name}, Quantity: ${item.quantity}, Total: ${itemTotal}`);

                const dropdownItem = document.createElement('div');
                dropdownItem.classList.add('dropdown-cart-item');
                dropdownItem.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-cover">
                    <div class="dropdown-cart-item-details">
                        <h5 class="text-sm font-medium">${item.name}</h5>
                        <p class="text-xs text-gray-500">Shs${item.price.toLocaleString()} x ${item.quantity}</p>
                    </div>
                    <span class="dropdown-cart-item-quantity text-sm font-medium">Shs${itemTotal.toLocaleString()}</span>
                `;
                dropdownCartItemsContainer.appendChild(dropdownItem);
            });
        }

        if (dropdownCartTotalElement) {
            dropdownCartTotalElement.textContent = `Shs${total.toLocaleString()}`;
            console.log(`products.js: Dropdown total updated to: Shs${total.toLocaleString()}`);
        }
    }

    // Add to cart functionality
    function setupAddToCartButtons() {
        const addToCartButtons = document.querySelectorAll('.add-card');

        addToCartButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                const productItem = event.target.closest('.product-item');
                
                if (!productItem) {
                    console.warn('products.js: Could not find product item');
                    return;
                }

                try {
                    const productId = productItem.dataset.productId;
                    const productImage = productItem.querySelector('.pi-pic img')?.src || '';
                    const productName = productItem.querySelector('.pi-text p')?.textContent.trim() || 'Unknown Product';
                    const productPriceText = productItem.querySelector('.pi-text h6')?.textContent.trim() || '0';
                    const productPrice = parseFloat(productPriceText.replace(/[^0-9.-]+/g, "")) || 0;

                    const product = {
                        id: productId,
                        name: productName,
                        price: productPrice,
                        image: productImage,
                        quantity: 1
                    };

                    let cart = getCart();
                    const existingProductIndex = cart.findIndex(item => item.id === product.id);

                    if (existingProductIndex !== -1) {
                        cart[existingProductIndex].quantity++;
                    } else {
                        cart.push(product);
                    }

                    localStorage.setItem('shoppingCart', JSON.stringify(cart));
                    console.log('products.js: Product added to cart:', product);

                    updateCartCount();
                    populateCartDropdown();
                    
                    // Visual feedback
                    button.textContent = 'Added!';
                    setTimeout(() => {
                        button.innerHTML = '<i class="flaticon-bag"></i><span>ADD TO CART</span>';
                    }, 2000);
                    
                } catch (error) {
                    console.error('products.js: Error adding item to cart:', error);
                }
            });
        });
    }

    // Dropdown visibility management
    function setupCartDropdown() {
        if (!shoppingCartContainer || !cartDropdown) {
            console.warn('products.js: Shopping cart elements not found');
            return;
        }

        let hideTimeout;

        shoppingCartContainer.addEventListener('mouseenter', () => {
            clearTimeout(hideTimeout);
            cartDropdown.classList.remove('hidden');
            cartDropdown.classList.add('block');
            console.log('products.js: Cart dropdown shown.');
        });

        shoppingCartContainer.addEventListener('mouseleave', () => {
            hideTimeout = setTimeout(() => {
                cartDropdown.classList.remove('block');
                cartDropdown.classList.add('hidden');
                console.log('products.js: Cart dropdown hidden after delay.');
            }, 200);
        });

        cartDropdown.addEventListener('mouseenter', () => {
            clearTimeout(hideTimeout);
        });

        cartDropdown.addEventListener('mouseleave', () => {
            cartDropdown.classList.remove('block');
            cartDropdown.classList.add('hidden');
        });
    }

    // Initialize everything
    function init() {
        setupAddToCartButtons();
        setupCartDropdown();
        updateCartCount();
        populateCartDropdown();
    }

    init();
});