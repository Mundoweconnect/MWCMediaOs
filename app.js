//Carregando módulos
require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const handlebars = require("express-handlebars");
const mongoose = require("mongoose");
const admin = require("./routes/admin");
const usuario = require("./routes/usuario");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
require("./model/Postagem");
const Postagem = mongoose.model("postagens");
require("./model/Categoria");
const Categoria = mongoose.model("categorias");
const passport = require("passport");
require("./config/auth")(passport);
//const {ensureAuthenticated}= require('../helpers/eAdmin')
//Configurações
//Seseão
app.use(
  session({
    secret: "mende",
    resave: true,
    saveUninitialized: true,
  })
);
//passport
app.use(passport.initialize());
app.use(passport.session());
//flash
app.use(flash());
//Middlewares
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});
//body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//handlebars or template engine
app.engine("handlebars", handlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.use("/files", express.static(path.resolve(__dirname, "public", "uploads")));

//Db config
const db = require("./config/db").mongoURI;
//Mongoose
mongoose.Promise = global.Promise;
//Conexão ao MongoDb
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Conectado Admin"))
  .catch((err) => console.log("Falha na conexão ao mongoDb" + err));

// Public
app.use(express.static(path.join(__dirname, "public")));

//Rotas
//Admin Page
app.use("/admin", admin);
app.use("/usuarios", usuario);
//Home Page
app.get(
  "/",
  /*ensureAuthenticated,*/ (req, res) => {
    Postagem.find()
      .populate("categoria")
      .sort({ data: "desc" })
      .then((postagens) => {
        res.render("index", { postagens: postagens });
      })
      .catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as postagens");
        res.redirect("/404");
      });
  }
);
//leia mais
app.get("/postagem/:slug", (req, res) => {
  Postagem.findOne({ slug: req.params.slug })
    .then((postagem) => {
      if (postagem) {
        res.render("postagem/index", { postagem: postagem });
      } else {
        req.flash("error_msg", "Esta postagem não existe!");
        res.redirect("/");
      }
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/");
    });
});
//Erro 404
app.get("/404", (req, res) => {
  res.send("Erro 404");
});
//listando as categorias
app.get("/categorias", function (req, res) {
  Categoria.find()
    .then((categorias) => {
      res.render("categorias/index", { categorias: categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno ao listar as categorias ");
      res.redirect("/");
    });
});

app.get("/categorias/:slug", (req, res) => {
  Categoria.findOne({ slug: req.params.slug })
    .then((categoria) => {
      if (categoria) {
        Postagem.find({ categoria: categoria._id })
          .then((postagens) => {
            res.render("categorias/postagens", {
              postagens: postagens,
              categoria: categoria,
            });
          })
          .catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar os post");
            res.redirect("/");
          });
      } else {
        req.flash("error_msg", "Esta categoria não existe!");
        res.redirect("/");
      }
    })
    .catch((err) => {
      req.flash(
        "error_msg",
        "Houve um erro ao carregar a pagina desta categoria"
      );
      res.redirect("/");
    });
});
//pesquisar
app.get("/pesquisar", (req, res, next) => {
  let noMatch = null;
  if (req.query.q) {
    const regex = new RegExp(escapeRegex(req.query.q), "gi");
    Postagem.find({ titulo: regex }, (err, result) => {
      if (err) {
        console.log("error on search", err);
      } else {
        if (result.length < 1) {
          noMatch = "Nenhum livro encontrado. Tente novamente.";
        }
        res.render("search-result", {
          result,
          locking: req.query.q,
          noMatch,
          path: "/pesquisar",
        });
      }
    });
  } else {
    res.render("search-result", {
      result: "Not found",
      noMatch,
      locking: req.query.q,
      path: "/pesquisar",
    });
  }
});
//search regex
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
//Servidor
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is runing on http://localhost:${port}/`);
});
