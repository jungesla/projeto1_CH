const express = require('express');
const path = require('path');
<<<<<<< HEAD
const http = require('http');
const socketIo = require('socket.io');
const { engine } = require('express-handlebars');
const Handlebars = require('handlebars');
=======
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const socketIo = require('socket.io');
const { engine } = require('express-handlebars');
>>>>>>> c3fb5e5e7b6494f44952b7ef71d080d08ab90d94
const connectDB = require('./dao/db');
const Product = require('./dao/models/Product');
const Cart = require('./dao/models/Cart');
const Message = require('./dao/models/Message');
<<<<<<< HEAD
const handlebarsLayouts = require('handlebars-layouts');
const mongoose = require('mongoose');

mongoose.set('strictQuery', true); 
// config pro Mongoose não apresentar aviso no terminal depois de rodar o start
=======

>>>>>>> c3fb5e5e7b6494f44952b7ef71d080d08ab90d94
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = 8080;

app.use(express.json());
<<<<<<< HEAD
app.use(express.static(path.join(__dirname, 'public')));

app.engine('handlebars', engine({
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  defaultLayout: 'main',
  extname: '.handlebars',
  helpers: handlebarsLayouts(Handlebars),
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  }
}));

app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));
=======
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
>>>>>>> c3fb5e5e7b6494f44952b7ef71d080d08ab90d94

io.on('connection', (socket) => {
  console.log('Novo cliente conectado');

  socket.on('message', async (data) => {
    const newMessage = new Message(data);
    await newMessage.save();
    io.emit('message', data);
  });

<<<<<<< HEAD
  socket.on('addToCart', async (data) => {
    try {
      const cart = await Cart.findOne({ userId: 'some_user_id' });

      if (!cart) {
        const newCart = new Cart({
          userId: 'some_user_id',
          products: [{ productId: data.productId, quantity: data.quantity }]
        });
        await newCart.save();
      } else {
        const productIndex = cart.products.findIndex(p => p.productId.toString() === data.productId);
        if (productIndex !== -1) {
          cart.products[productIndex].quantity += data.quantity;
        } else {
          cart.products.push({ productId: data.productId, quantity: data.quantity });
        }
        await cart.save();
      }

      io.emit('cartUpdated', { status: 'sucesso', message: 'Produto adicionado ao carrinho' });
    } catch (error) {
      console.error('Erro ao adicionar produto ao carrinho:', error);
      io.emit('cartUpdated', { status: 'erro', message: 'Erro ao adicionar produto ao carrinho' });
    }
  });

=======
>>>>>>> c3fb5e5e7b6494f44952b7ef71d080d08ab90d94
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

app.get('/chat', (req, res) => {
  res.render('chat');
});

app.get('/products', async (req, res) => {
  try {
    let { limit = 10, page = 1, sort, query } = req.query;
    limit = parseInt(limit);
    page = parseInt(page);

    const filters = query ? { $or: [{ category: query }, { status: query }] } : {};
    const sortOption = sort ? { price: sort === 'asc' ? 1 : -1 } : {};

    const products = await Product.find(filters)
      .sort(sortOption)
      .limit(limit)
      .skip((page - 1) * limit);

    const totalProducts = await Product.countDocuments(filters);
    const totalPages = Math.ceil(totalProducts / limit);

    res.render('products', {
      products,
      totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
      page,
      limit,
      sort,
      query,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
    });
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ status: 'erro', message: 'Erro interno do servidor' });
  }
});

const viewsRouter = express.Router();

viewsRouter.get('/carts/:cid', async (req, res) => {
  const { cid } = req.params;
  try {
    const cart = await Cart.findById(cid).populate('products.productId');

    if (!cart) {
      return res.status(404).json({ status: 'erro', message: 'Carrinho não encontrado' });
    }

    res.render('cart', { cart });
  } catch (error) {
    console.error('Erro ao buscar carrinho:', error);
    res.status(500).json({ status: 'erro', message: 'Erro interno do servidor' });
  }
});

<<<<<<< HEAD
=======

>>>>>>> c3fb5e5e7b6494f44952b7ef71d080d08ab90d94
viewsRouter.get('/products/:pid', async (req, res) => {
  const { pid } = req.params;
  try {
    const product = await Product.findById(pid);

    if (!product) {
      return res.status(404).json({ status: 'erro', message: 'Produto não encontrado' });
    }

    res.render('productDetail', { product });
  } catch (error) {
    console.error('Erro ao buscar produto com ID:', error);
    res.status(500).json({ status: 'erro', message: 'Erro interno do servidor' });
  }
});

app.use('/views', viewsRouter);

const productsRouter = express.Router();

productsRouter.get('/', async (req, res) => {
  try {
    let { limit = 10, page = 1, sort, query } = req.query;
    limit = parseInt(limit);
    page = parseInt(page);

    const filters = query ? { $or: [{ category: query }, { status: query }] } : {};
    const sortOption = sort ? { price: sort === 'asc' ? 1 : -1 } : {};

    const products = await Product.find(filters)
      .sort(sortOption)
      .limit(limit)
      .skip((page - 1) * limit);

    const totalProducts = await Product.countDocuments(filters);
    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      status: 'sucesso',
      payload: products,
      totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
      page,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevLink: page > 1 ? `/api/products?limit=${limit}&page=${page - 1}&sort=${sort}&query=${query}` : null,
      nextLink: page < totalPages ? `/api/products?limit=${limit}&page=${page + 1}&sort=${sort}&query=${query}` : null,
    });
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ status: 'erro', message: 'Erro interno do servidor' });
<<<<<<< HEAD
  }
});

productsRouter.post('/', async (req, res) => {
  const { title, description, price, thumbnail, code, stock, category, status } = req.body;

  if (!title || !description || !price || !thumbnail || !code || !stock || !category || !status) {
    return res.status(400).json({ status: 'erro', message: 'Todos os campos são obrigatórios' });
  }

  try {
    const newProduct = new Product({
      title,
      description,
      price,
      thumbnail,
      code,
      stock,
      category,
      status
    });

    await newProduct.save();
    res.status(201).json({ status: 'sucesso', message: 'Produto criado com sucesso', payload: newProduct });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ status: 'erro', message: 'Erro interno do servidor' });
=======
>>>>>>> c3fb5e5e7b6494f44952b7ef71d080d08ab90d94
  }
});

productsRouter.get('/:pid', async (req, res) => {
  const { pid } = req.params;
  try {
    const product = await Product.findById(pid);

    if (!product) {
      return res.status(404).json({ status: 'erro', message: 'Produto não encontrado' });
    }

    res.json({ status: 'sucesso', payload: product });
  } catch (error) {
    console.error('Erro ao buscar produto com ID:', error);
    res.status(500).json({ status: 'erro', message: 'Erro interno do servidor' });
  }
});

<<<<<<< HEAD
productsRouter.put('/:pid', async (req, res) => {
  const { pid } = req.params;
  const { title, description, price, thumbnail, code, stock, category, status } = req.body;

  if (!title || !description || !price || !thumbnail || !code || !stock || !category || !status) {
    return res.status(400).json({ status: 'erro', message: 'Todos os campos são obrigatórios' });
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      pid,
      { title, description, price, thumbnail, code, stock, category, status },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ status: 'erro', message: 'Produto não encontrado' });
    }

    res.json({ status: 'sucesso', message: 'Produto atualizado com sucesso', payload: updatedProduct });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
=======
productsRouter.post('/', async (req, res) => {
  const {
    title,
    description,
    code,
    price,
    stock,
    category,
    thumbnails,
  } = req.body;

  if (!title || !description || !code || !price || !stock || !category) {
    return res.status(400).json({ status: 'erro', message: 'Todos os campos exceto thumbnails são obrigatórios' });
  }

  try {
    const newProduct = new Product({
      title,
      description,
      code,
      price,
      status: req.body.status ?? true,
      stock,
      category,
      thumbnails: thumbnails || [],
    });

    const savedProduct = await newProduct.save();
    res.status(201).json({ status: 'sucesso', payload: savedProduct });
  } catch (error) {
    console.error('Erro ao adicionar o produto:', error);
    res.status(500).json({ status: 'erro', message: 'Erro interno do servidor' });
  }
});

productsRouter.put('/:pid', async (req, res) => {
  const { pid } = req.params;
  const updates = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(pid, updates, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ status: 'erro', message: 'Produto não encontrado' });
    }

    res.json({ status: 'sucesso', payload: updatedProduct });
  } catch (error) {
    console.error('Erro ao atualizar o produto:', error);
>>>>>>> c3fb5e5e7b6494f44952b7ef71d080d08ab90d94
    res.status(500).json({ status: 'erro', message: 'Erro interno do servidor' });
  }
});

productsRouter.delete('/:pid', async (req, res) => {
  const { pid } = req.params;
<<<<<<< HEAD
=======

>>>>>>> c3fb5e5e7b6494f44952b7ef71d080d08ab90d94
  try {
    const deletedProduct = await Product.findByIdAndDelete(pid);

    if (!deletedProduct) {
      return res.status(404).json({ status: 'erro', message: 'Produto não encontrado' });
    }

<<<<<<< HEAD
    res.json({ status: 'sucesso', message: 'Produto excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
=======
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar o produto:', error);
>>>>>>> c3fb5e5e7b6494f44952b7ef71d080d08ab90d94
    res.status(500).json({ status: 'erro', message: 'Erro interno do servidor' });
  }
});

app.use('/api/products', productsRouter);

<<<<<<< HEAD
=======
const cartsRouter = express.Router();

cartsRouter.post('/', async (req, res) => {
  try {
    const newCart = new Cart({
      userId: uuidv4(),
      products: [],
    });

    const savedCart = await newCart.save();
    res.status(201).json({ status: 'sucesso', payload: savedCart });
  } catch (error) {
    console.error('Erro ao criar novo carrinho:', error);
    res.status(500).json({ status: 'erro', message: 'Erro interno do servidor' });
  }
});


cartsRouter.put('/:cid/products', async (req, res) => {
  const { cid } = req.params;
  const { products } = req.body;

  if (!products || !Array.isArray(products)) {
    return res.status(400).json({ status: 'erro', message: 'Produtos inválidos' });
  }

  try {
    const cart = await Cart.findById(cid);

    if (!cart) {
      return res.status(404).json({ status: 'erro', message: 'Carrinho não encontrado' });
    }


    for (let product of products) {
      if (!product.productId || typeof product.quantity !== 'number' || product.quantity < 0) {
        return res.status(400).json({ status: 'erro', message: 'Produto ou quantidade inválida' });
      }
    }


    cart.products = products;
    await cart.save();

    res.json({ status: 'sucesso', message: 'Carrinho atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar o carrinho:', error);
    res.status(500).json({ status: 'erro', message: 'Erro interno do servidor' });
  }
});

cartsRouter.put('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;

  if (typeof quantity !== 'number' || quantity < 0) {
    return res.status(400).json({ status: 'erro', message: 'Quantidade inválida' });
  }

  try {
    const cart = await Cart.findById(cid);

    if (!cart) {
      return res.status(404).json({ status: 'erro', message: 'Carrinho não encontrado' });
    }

    const productIndex = cart.products.findIndex(item => item.productId.toString() === pid);

    if (productIndex === -1) {
      return res.status(404).json({ status: 'erro', message: 'Produto não encontrado no carrinho' });
    }


    cart.products[productIndex].quantity = quantity;
    await cart.save();

    res.json({ status: 'sucesso', message: 'Quantidade do produto atualizada com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar a quantidade do produto no carrinho:', error);
    res.status(500).json({ status: 'erro', message: 'Erro interno do servidor' });
  }
});

cartsRouter.get('/:cid', async (req, res) => {
  const { cid } = req.params;
  try {
    const cart = await Cart.findById(cid).populate('products.productId');

    if (!cart) {
      return res.status(404).json({ status: 'erro', message: 'Carrinho não encontrado' });
    }

    res.json({ status: 'sucesso', payload: cart });
  } catch (error) {
    console.error('Erro ao buscar carrinho:', error);
    res.status(500).json({ status: 'erro', message: 'Erro interno do servidor' });
  }
});

cartsRouter.delete('/:cid', async (req, res) => {
  const { cid } = req.params;

  try {
    const deletedCart = await Cart.findByIdAndDelete(cid);

    if (!deletedCart) {
      return res.status(404).json({ status: 'erro', message: 'Carrinho não encontrado' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar o carrinho:', error);
    res.status(500).json({ status: 'erro', message: 'Erro interno do servidor' });
  }
});

app.use('/api/carts', cartsRouter);

>>>>>>> c3fb5e5e7b6494f44952b7ef71d080d08ab90d94
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
