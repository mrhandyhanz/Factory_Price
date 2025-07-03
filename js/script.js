// product.js — for index.html only

let cartItems = JSON.parse(localStorage.getItem('cart')) || [];

const cartIcon = document.getElementById('cart-icon');
const cartCount = document.querySelector('.cart-count');
const addToCartButtons = document.querySelectorAll('.add-to-cart');

function updateCartCount() {
    cartCount.textContent = cartItems.length;
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    updateCartCount();
}

function addToCart(title, price) {
    cartItems.push({ title, price });
    saveCart();
}

addToCartButtons.forEach(button => {
    button.addEventListener('click', function () {
        const productCard = this.closest('.product-card');
        const title = productCard.querySelector('.product-title').textContent;
        const price = productCard.querySelector('.product-price').textContent;

        addToCart(title, price);

        button.textContent = 'Added!';
        button.style.backgroundColor = '#4BB543';
        setTimeout(() => {
            button.textContent = 'Add to Cart';
            button.style.backgroundColor = '';
        }, 1500);
    });
});

cartIcon.addEventListener('click', function () {
    window.location.href = 'cart.html'; // Navigate to cart page
});

updateCartCount();
