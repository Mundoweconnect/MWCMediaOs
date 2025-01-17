const express = require("express");
const router = express.Router();
const multer = require("multer");
var uploadConfig = require("../config/multer");
const mongoose = require("mongoose");
require("../model/Categoria");
const Categoria = mongoose.model("categorias");
require("../model/Postagem");
const Postagem = mongoose.model("postagens");
const { eAdmin } = require("../helpers/eAdmin");

router.get("/", eAdmin, (req, res) => {
  res.render("admin/index");
});

router.get("/posts", (req, res) => {
  res.send("Page Posts");
});

router.get("/categorias", eAdmin, (req, res) => {
  Categoria.find()
    .sort({ date: "desc" })
    .then((categorias) => {
      res.render("admin/categorias", { categorias: categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar as categorias");
      res.redirect("/admin");
    });
});

router.get("/categorias/add", eAdmin, (req, res) => {
  res.render("admin/addcategorias");
});

router.post("/categorias/nova", eAdmin, (req, res) => {
  var erros = [];

  if (
    !req.body.nome ||
    typeof req.body.nome == undefined ||
    req.body.nome == null
  ) {
    erros.push({ texto: "Nome inválido!" });
  }

  if (req.body.nome.length < 2) {
    erros.push({ texto: "Nome da categoria é muito curto!" });
  }

  if (erros.length > 0) {
    res.render("admin/addcategorias", { erros: erros });
  } else {
    const novaCategoria = {
      nome: req.body.nome,
      slug: req.body.nome,
    };
    new Categoria(novaCategoria)
      .save()
      .then(() => {
        req.flash("success_msg", "Categoria criada com sucesso!");
        res.redirect("/admin/categorias");
      })
      .catch((err) => {
        req.flash(
          "error_msg",
          "Houve um erro ao salvar a Categoria. Tente novamente!"
        );
        console.log("Falha ao criar a categoria" + err);
      });
  }
});

router.get("/categorias/edit/:id", eAdmin, (req, res) => {
  Categoria.findOne({ _id: req.params.id })
    .then((categoria) => {
      res.render("admin/editcategorias", { categoria: categoria });
    })
    .catch((err) => {
      req.flash("error_msg", "Esta categoria não existe");
      res.redirect("/admin/categorias");
    });
});

router.post("/categorias/edit", eAdmin, (req, res) => {
  Categoria.findOne({ _id: req.body.id })
    .then((categoria) => {
      categoria.nome = req.body.nome;
      categoria.slug = req.body.nome;

      categoria
        .save()
        .then(() => {
          req.flash("success_msg", "Categoria editada com sucesso!");
          res.redirect("/admin/categorias");
        })
        .catch((err) => {
          req.flash("error_msg", "Houve um erro interno ao salvar a categoria");
          res.redirect("/admin/categorias");
        });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao editar a categoria");
      res.redirect("/admin/categorias");
    });
});

router.post("/categorias/deletar", eAdmin, (req, res) => {
  Categoria.deleteOne({ _id: req.body.id })
    .then(() => {
      req.flash("success_msg", "Categoria deletada com sucesso!");
      res.redirect("/admin/categorias");
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao deletar a categoria");
      res.redirect("/admin/categorias");
    });
});

router.get("/postagens", eAdmin, (req, res) => {
  Postagem.find()
    .populate("categoria")
    .sort({ data: "desc" })
    .then((postagens) => {
      res.render("admin/postagens", { postagens: postagens });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar as postagens");
      res.redirect("admin/postagens");
    });
});

router.get("/postagens/add", eAdmin, (req, res) => {
  Categoria.find()
    .then((categorias) => {
      res.render("admin/addpostagem", { categorias: categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao carregar o formulário");
      res.redirect("/admin");
    });
});

router.post(
  "/postagens/nova",
  multer(uploadConfig).single("file"),
  eAdmin,
  async function (req, res) {
    var erros = [];
    const { originalname, size, key, location: url = "" } = req.file;
    if (req.body.categoria == "0") {
      erros.push({ texto: "Categoria inválida, registre uma categoria" });
    }

    if (erros.length > 0) {
      res.render("admin/addpostagem", { erros: erros });
    } else {
      const novaPostagem = {
        titulo: req.body.titulo,
        descricao: req.body.descricao,
        categoria: req.body.categoria,
        slug: req.body.titulo,
        imagename: originalname,
        size,
        key,
        url,
      };

      await Postagem(novaPostagem)
        .save()
        .then(() => {
          req.flash("success_msg", "Postagem criada com sucesso!");
          res.redirect("/admin/postagens");
        })
        .catch((err) => {
          req.flash(
            "error_msg",
            "Houve um erro ao salvar a postagem. Tente novamente!"
          );
          res.redirect("/admin/postagens");
          console.log("Falha ao criar a postagem" + err);
        });
    }
  }
);

router.get("/postagens/edit/:id", eAdmin, (req, res) => {
  Postagem.findOne({ _id: req.params.id })
    .then((postagem) => {
      Categoria.find()
        .then((categorias) => {
          res.render("admin/editpostagens", {
            categorias: categorias,
            postagem: postagem,
          });
        })
        .catch((err) => {
          req.flash("error_msg", "Houve um erro ao listar as categorias");
          res.redirect("/admin/postagens");
        });
    })
    .catch((err) => {
      req.flash(
        "error_msg",
        "Houve um erro ao carregar o formulário de edição"
      );
      res.redirect("/admin/postagens");
    });
});

router.post("/postagens/edit", eAdmin, (req, res) => {
  Postagem.findOne({ _id: req.body.id })
    .then((postagem) => {
      postagem.titulo = req.body.titulo;
      postagem.slug = req.body.titulo;
      postagem.descricao = req.body.descricao;
      postagem.categoria = req.body.categoria;
      postagem
        .save()
        .then(() => {
          req.flash("success_msg", "Postagem editada com sucesso!");
          res.redirect("/admin/postagens");
        })
        .catch((err) => {
          req.flash("error_msg", "Houve um erro ao salvar a postagem");
          res.redirect("/admin/postagens");
        });
    })
    .catch((err) => {
      console.log(err);
      req.flash("error_msg", "Houve um erro ao salvar a edição");
      res.redirect("/admin/postagens");
    });
});

router.get("/postagens/deletar/:id", eAdmin, (req, res) => {
  Postagem.deleteOne({ _id: req.params.id })
    .then(() => {
      req.flash("success_msg", "Postagem deletada com sucesso!");
      res.redirect("/admin/postagens");
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao deletar a Postagem");
      res.redirect("/admin/postagens");
    });
});
module.exports = router;
