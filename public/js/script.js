const socket = io();

function addToCart(productId) {
  const data = {
    productId,
    quantity: 1
  };

  socket.emit('addToCart', data);
  alert('Produto adicionado ao carrinho');
}

socket.on('connect', () => {
  console.log('Conectado ao servidor');
});
