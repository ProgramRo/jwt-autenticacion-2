const express = require('express')
const users = require('./data/users.js')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const app = express()

// Llave que se usará para firmar los tokens
const secretKey = 'Mi Llave Ultra Secreta'

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

app.get("/login", (req, res) => {
    res.send(`
        <form action="/login" method="post">
        <input name="email" type="email">
        <input name="password" type="password">
        <button type="submit">Iniciar Sesión</button>
        </form>
    `)
})

// Paso 1
app.post("/login", (req, res) => {
    // Paso 2
    const { email, password } = req.body;
    // Paso 3
    const user = users.find((u) => u.email === email && u.password === password);
    // Paso 4
    if (user) {
        // Paso 5
        const token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + 120,
            data: user,
        }, secretKey);
    // Paso 6
    res.send(`
        <a href="/Dashboard?token=${token}"> <p> Ir al Dashboard </p> </a>
        Bienvenido, ${email}.
        <script>
        localStorage.setItem('token', JSON.stringify("${token}"))
        </script>
    `)
    } else {
        // Paso 7
        res.send("Usuario o contraseña incorrecta")
    }
})

// Paso 1
app.get("/Dashboard", (req, res) => {
    // Paso 2
    let { token } = req.query
    // Paso 3
    jwt.verify(token || '', secretKey, (err, decoded) => {
        // Paso 4
        if (err) {
            res.status(401).send({
                error: "401 Unauthorized",
                message: err.message,
            })
        } else {
            res.send(`Bienvenido al Dashboard ${decoded.data.email}`)
        }
    })
})


app.get('/get-token/:username', (req, res) => {
  const user = users.find((u) => u.email === req.params.username)
  // Generación del nuevo token con método sign
  const token = jwt.sign(user, secretKey)
  const data = {
    token
  }
  res.json(data)
})

app.get('/token/:token', (req, res) => {
  const token = req.params.token
  // Generación del nuevo token con método sign
  jwt.verify(token, secretKey, (err, decode) => {
    if (err) {
      res.status(403).json({
        message: 'Token inválido',
      })
    } else {
      const data = {
        decode
      }
      res.json(data)
    }
  })
})

app.listen(3000, () => console.log('Your app listening on port 3000'))
