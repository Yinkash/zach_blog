import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
import fs from "fs";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.locals.year = new Date().getFullYear();
const storage = multer.diskStorage({
  destination: "public/images",
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e6);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    cb(null, file.mimetype.startsWith("image/"));
  },
});

var dte = new Date().toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

let posts = [
  {
    id: 1,
    title: "Wear What Speaks for You",
    text: "What you wear is the fastest way to introduce yourself without saying a word. While fashion is often seen as just fleeting trends, true style is really about self-expression and confidence.",
    img: "yinka.jpg",
    date: "Jun 11, 2026",
    author: "Yinka",
  },
  {
    id: 2,
    title: "Good Hygiene: Small Habits, Big Impact",
    text: "Good hygiene is one of the easiest ways to protect your health and feel confident every day. Taking care of your body keeps germs away and helps you start every morning feeling fresh.",
    img: "ade.jpg",
    date: "Oct 1, 2026",
    author: "Adetayo",
  },
  {
    id: 3,
    title: "Gratitude: The Simple Habit That Changes Everything",
    text: "Gratitude is more than just saying (thank you). It is the simple practice of noticing and appreciating the good things in your life, even on busy or stressful days. When you focus on what you have instead of what is missing, your mindset shifts. Practicing gratitude takes only a minute a day, yet it brings lasting peace and joy to your life.",
    img: "yinkasta.jpg",
    date: dte,
    author: "Yinkasta",
  },
];
let nextId = 4; // use this when the submit route creates new posts
/*app.get("/", (req, res) => {
  res.render("index.ejs", { posts: posts });
});*/

// Delete a post
app.post("/delete/:id", (req, res) => {
  const id = parseInt(req.params.id);
  posts = posts.filter((p) => p.id !== id);
  res.redirect("/");
});

// Show the edit form, pre-filled
app.get("/edit/:id", (req, res) => {
  const post = posts.find((p) => p.id === parseInt(req.params.id));
  if (!post) return res.redirect("/");
  res.render("edit.ejs", { post });
});

// Save the changes
app.post("/edit/:id", upload.single("img"), (req, res) => {
  const id = parseInt(req.params.id);
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) return res.redirect("/");

  posts[index].author = req.body.author;
  posts[index].title = req.body.title;
  posts[index].text = req.body.text;

  if (req.file) {
    // delete the old picture file, if there was one
    if (posts[index].img) {
      fs.unlink(path.join("public/images", posts[index].img), () => {});
    }
    posts[index].img = req.file.filename;
  }

  res.redirect(`/?post=${index}`);
});
app.get("/", (req, res) => {
  const total = posts.length;
  let index = parseInt(req.query.post) || 0;
  index = Math.max(0, Math.min(index, total - 1));

  res.render("index.ejs", { post: posts[index], index, total });
});
app.get("/write", (req, res) => {
  res.render("write.ejs", { active: "write" });
});

app.post("/submit", upload.single("img"), (req, res) => {
  const newPost = {
    id: nextId++,
    author: req.body.author,
    title: req.body.title,
    text: req.body.text,
    img: req.file ? req.file.filename : "",
    date: dte,
  };

  posts.push(newPost);
  res.redirect(`/?post=${posts.length - 1}`);
});
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
