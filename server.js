const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;

const app = express();
const PORT = 3000;

app.use(express.json());

const productsRouter = express.Router();
const productsFilePath = `${__dirname}/produtos.json`;

async function readProductsFile() {
  try {
    const data = await fs.readFile(productsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler arquivo de produtos:', error);
    return [];
  }
}

productsRouter.get('/', async (req, res) => {
  try {
    let { limit } = req.query;
    limit = limit ? parseInt(limit) : undefined;

    const products = await readProductsFile();
    const limitedProducts = limit ? products.slice(0, limit) : products;

    res.json(limitedProducts);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

productsRouter.get('/:pid', async (req, res) => {
  const { pid } = req.params;
  try {
    const products = await readProductsFile();
    const product = products.find(prod => prod.id === pid);

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(product);
  } catch (error) {
    console.error('Erro ao buscar produto com ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

productsRouter.post('/', async (req, res) => {
  const {
    title,
    description,
    code,
    price,
    stock,
    thumbnails,
  } = req.body;

  if (!title || !description || !code || !price || !stock) {
    return res.status(400).json({ error: 'Todos os campos exceto thumbails são obrigatórios' });
  }

  try {
    const newProduct = {
      id: uuidv4(),
      title,
      description,
      code,
      price,
      status: true,
      stock,
      thumbnails: thumbnails || [],
    };

    const productsList = await readProductsFile();
    productsList.push(newProduct);
    await fs.writeFile(productsFilePath, JSON.stringify(productsList, null, 2));

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Erro ao adicionar o produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.use('/api/products', productsRouter);

const cartsRouter = express.Router();
const cartsFilePath = `${__dirname}/carrinho.json`;

async function readCartsFile() {
  try {
    const data = await fs.readFile(cartsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler arquivo de carrinhos:', error);
    return [];
  }
}

cartsRouter.post('/', async (req, res) => {
  try {
    const newCart = {
      id: uuidv4(),
      products: [],
    };

    const carts = await readCartsFile();
    carts.push(newCart);
    await fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2));

    res.status(201).json(newCart);
  } catch (error) {
    console.error('Erro ao criar novo carrinho:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

cartsRouter.get('/:cid', async (req, res) => {
  const { cid } = req.params;
  try {
    const carts = await readCartsFile();
    const cart = carts.find(c => c.id === cid);

    if (!cart) {
      return res.status(404).json({ error: 'Carrinho não encontrado' });
    }

    res.json(cart.products);
  } catch (error) {
    console.error('Erro ao buscar produtos do carrinho:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

cartsRouter.post('/:cid/product/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const { quantidade } = req.body;

  if (!quantidade || isNaN(parseInt(quantidade))) {
    return res.status(400).json({ error: 'A quantidade do produto é obrigatória e deve ser um número' });
  }

  try {
    const carts = await readCartsFile();
    const cartIndex = carts.findIndex(c => c.id === cid);

    if (cartIndex === -1) {
      return res.status(404).json({ error: 'Carrinho não encontrado' });
    }

    const product = {
      id: pid,
      quantidade: parseInt(quantidade),
    };

    const existingProductIndex = carts[cartIndex].products.findIndex(p => p.id === pid);
    if (existingProductIndex !== -1) {
      carts[cartIndex].products[existingProductIndex].quantidade += parseInt(quantidade);
    } else {
      carts[cartIndex].products.push(product);
    }

    await fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2));

    res.status(200).json({ message: 'Produto adicionado ao carrinho com sucesso' });
  } catch (error) {
    console.error('Erro ao adicionar produto ao carrinho:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.use('/api/carts', cartsRouter);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

router.put('/:pid', (req, res) => {
  const products = readProductsFile();
  const index = products.findIndex(p => p.id === req.params.pid);
  if (index !== -1) {
      const updatedProduct = { ...products[index], ...req.body, id: products[index].id };
      products[index] = updatedProduct;
      writeProductsFile(products);
      res.json(updatedProduct);
  } else {
      res.status(404).send('Produto não encontrado');
  }
});

router.delete('/:pid', (req, res) => {
  let products = readProductsFile();
  const productExists = products.some(p => p.id === req.params.pid);
  if (productExists) {
      products = products.filter(p => p.id !== req.params.pid);
      writeProductsFile(products);
      res.send('Produto deletado');
  } else {
      res.status(404).send('Produto não encontrado');
  }
});
const productsRouter = require('./routes/products');
app.use('/api/products', productsRouter);

