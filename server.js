// Needed for dotenv
require("dotenv").config();

// Needed for Express
var express = require("express");
var app = express();

// Needed for EJS
app.set("view engine", "ejs");

// Needed for public directory
app.use(express.static(__dirname + "/public"));

// Needed for parsing form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Needed for Prisma to connect to database
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Main landing page
app.get("/", async function (req, res) {
	// Try-Catch for any errors
	try {
		// Get all blog posts
		const events = await prisma.event.findMany({
			orderBy: [
				{
					created: "desc",
				},
			],
		});

		// Render the homepage with all the blog posts
		await res.render("pages/home", { events: events });
	} catch (error) {
		res.render("pages/home");
		console.log(error);
	}
});

// Main landing page
app.get("/test", async function (req, res) {
	// Try-Catch for any errors
	try {
		// Get all blog posts
		const blogs = await prisma.post.findMany({
			orderBy: [
				{
					id: "desc",
				},
			],
		});

		// Render the homepage with all the blog posts
		await res.render("pages/test", { blogs: blogs });
	} catch (error) {
		res.render("pages/test");
		console.log(error);
	}
});

// View an Event
app.get("/events/:id", async (req, res) => {
	const { id } = req.params;
	try {
		const event = await prisma.event.findFirst({
			include: {
				questions: true,
			},
			where: {
				code: id,
			}
		});

		const questions = await prisma.question.findMany({
			where: {
				eventId: event.id,
			},
			orderBy: [
                {
                    votes: "desc",
                },
                {
                    created: "asc",
                },
            ],
		});

		await res.render("pages/event", { event: event, questions: questions });
	} catch (error) {
        console.log('error');
		res.render("pages/home");
		console.log(error);
	}
});

// Questions to an evevnt
app.post("/events/:id", async (req, res) => {
	const { id } = req.params;
	const { question } = req.body;
	try {
		const event = await prisma.event.findFirst({
			include: {
				questions: true,
			},
			where: {
				code: id,
			},
		});
		if (event) {
			const questionCreated = await prisma.question.create({
				data: {
					event: {
						connect: {
							id: event.id,
						},
					},
					content: question,
				},
			});
			res.redirect("/events/" + event.code);
		} else {
			res.redirect("/");
			console.log("Invalid Event");
		}
	} catch (error) {
		res.redirect("/");
		console.log(error);
	}
});

// About page
app.get("/about", function (req, res) {
	res.render("pages/about");
});

// New post page
app.get("/new", function (req, res) {
	res.render("pages/new");
});

// New Event page
app.get("/newevent", function (req, res) {
	res.render("pages/newevent");
});

// Create a new post
app.post("/new", async function (req, res) {
	// Try-Catch for any errors
	try {
		// Get the title and content from submitted form
		const { title, content } = req.body;

		// Reload page if empty title or content
		if (!title || !content) {
			console.log("Unable to create new post, no title or content");
			res.render("pages/new");
		} else {
			// Create post and store in database
			const blog = await prisma.post.create({
				data: { title, content },
			});

			// Redirect back to the homepage
			res.redirect("/");
		}
	} catch (error) {
		console.log(error);
		res.render("pages/new");
	}
});

// Create a new event
app.post("/newevent", async function (req, res) {
	console.log("called");
	function randomString(length, chars) {
		var result = "";
		for (var i = length; i > 0; --i)
			result += chars[Math.floor(Math.random() * chars.length)];
		return result;
	}
	var rString = randomString(
		6,
		"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	);

	// Try-Catch for any errors
	try {
		// Get the title and content from submitted form
		const { title } = req.body;

		// Reload page if empty title or content
		if (!title) {
			console.log("No event name provided");
			res.render("pages/newevent");
		} else {
			// Create post and store in database
			const event = await prisma.event.create({
				data: { title: title, code: rString },
			});
			res.redirect("/events/" + rString);
		}
	} catch (error) {
		console.log(error);
		res.render("pages/newevent");
	}
});

// Delete a post by id
app.post("/delete/:id", async (req, res) => {
	const { id } = req.params;

	try {
		await prisma.post.delete({
			where: { id: parseInt(id) },
		});

		// Redirect back to the homepage
		res.redirect("/");
	} catch (error) {
		console.log(error);
		res.redirect("/");
	}
});

// Tells the app which port to run on
app.listen(8080);

app.get("/demo", function (req, res) {
	res.render("pages/demo");
});
