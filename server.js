const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const { engine } = require('express-handlebars');
const Handlebars = require('handlebars');
const connectDB = require('./dao/db');
const Product = require('./dao/models/Product');
const Cart = require('./dao/models/Cart');
const Message = require('./dao/models/Message');
const handlebarsLayouts = require('handlebars-layouts');
const mongoose = require('mongoose');

mongoose.set('strictQuery', true); 
// config pro Mongoose não apresentar aviso no terminal depois de rodar o start
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = 8080;

app.use(express.json());
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

io.on('connection', (socket) => {
  console.log('Novo cliente conectado');

  socket.on('message', async (data) => {
    const newMessage = new Message(data);
    await newMessage.save();
    io.emit('message', data);
  });

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
    res.status(500).json({ status: 'erro', message: 'Erro interno do servidor' });
  }
});

productsRouter.delete('/:pid', async (req, res) => {
  const { pid } = req.params;
  try {
    const deletedProduct = await Product.findByIdAndDelete(pid);

    if (!deletedProduct) {
      return res.status(404).json({ status: 'erro', message: 'Produto não encontrado' });
    }

    res.json({ status: 'sucesso', message: 'Produto excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    res.status(500).json({ status: 'erro', message: 'Erro interno do servidor' });
  }
});

app.use('/api/products', productsRouter);

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
