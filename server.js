const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;

const app = express();
const PORT = 3000;
const productsFilePath = `${__dirname}/produtos.json`;

app.use(express.json());


async function readProductsFile() {
  try {
    const data = await fs.readFile(productsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler arquivo de produtos:', error);
    return [];
  }
}

async function writeProductsFile(products) {
  try {
    await fs.writeFile(productsFilePath, JSON.stringify(products, null, 2));
  } catch (error) {
    console.error('Erro ao escrever no arquivo de produtos:', error);
  }
}

//listar tudo
app.get('/products', async (req, res) => {
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

//buscar por id
app.get('/products/:pid', async (req, res) => {
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

//add
app.post('/products', async (req, res) => {
  const {
    title,
    description,
    code,
    price,
    stock,
    thumbnails,
  } = req.body;

  if (!title || !description || !code || !price || !stock) {
    return res.status(400).json({ error: 'Todos os campos exceto thumbnails são obrigatórios' });
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

    const products = await readProductsFile();
    products.push(newProduct);
    await writeProductsFile(products);

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Erro ao adicionar o produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

//atualizar
app.put('/products/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const products = await readProductsFile();
    const index = products.findIndex(p => p.id === pid);

    if (index !== -1) {
      const updatedProduct = { ...products[index], ...req.body, id: pid };
      products[index] = updatedProduct;
      await writeProductsFile(products);
      res.json(updatedProduct);
    } else {
      res.status(404).send('Produto não encontrado');
    }
  } catch (error) {
    console.error('Erro ao atualizar o produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

//deletar
app.delete('/products/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    let products = await readProductsFile();
    const productExists = products.some(p => p.id === pid);

    if (productExists) {
      products = products.filter(p => p.id !== pid);
      await writeProductsFile(products);
      res.send('Produto deletado');
    } else {
      res.status(404).send('Produto não encontrado');
    }
  } catch (error) {
    console.error('Erro ao deletar o produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

