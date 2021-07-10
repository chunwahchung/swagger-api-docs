const express = require("express");
const router = express.Router();
const { nanoid } = require("nanoid");

const idLength = 8;

/**
 * @swagger
 * components:
 *  schemas:
 *      Book:
 *          type: object
 *          required:
 *              - title
 *              - author
 *          properties:
 *              id:
 *                  type: string
 *                  description: An auto-generated id
 *              title:
 *                  type: string
 *                  description: The book title
 *              author:
 *                  type: string
 *                  description: The author of the book
 *          example:
 *              id: d5fE_asz
 *              title: The Black Swan    
 *              author: Nassim Nicholas Taleb
 */

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: The books managing API
 */

/**
 * @swagger
 * paths:
 *   /books:
 *     get:
 *       summary: Returns a list of all books
 *       tags:
 *         - Books
 *       responses: 
 *         200:
 *           description: The list of books
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Book'
 */
router.get("/", (req, res) => {
    const books = req.app.db.get("books");

    res.send(books);
});

/**
 * @swagger
 * paths: 
 *   /books/{id}:
 *     get:
 *       summary: Get a book by id
 *       tags: [Books]
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           example: d5fE_asz
 *           require: true
 *           description: The book id
 *       responses:
 *         200:
 *           description: The book by id
 *           content:
 *             applicationjson:
 *               schema:
 *                 $ref: '#/components/schemas/Book'
 *         404:
 *           description: The book was not found
 */
router.get("/:id", (req,res) => {
    const book = req.app.db.get("books").find({ id: req.params.id }).value();

    if (!book) {
        res.sendStatus(404);
        return;
    }

    res.send(book);
});

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Add book to library
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses: 
 *       200: 
 *         description: The book was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       500:
 *        description: Server Error
 */ 
router.post("/", (req, res) => {
    try {
        const book = {
            id: nanoid(idLength),
            ...req.body
        }

        req.app.db.get("books").push(book).write();

        res.send(book);
    } catch (error) {
        return res.status(500).send(error);
    }
});

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary:
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         example: d5fE_asz
 *         require: true
 *         description: The book id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: The book was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: The book was not found
 *       500: 
 *         description: Server Error
 */
router.put("/:id", (req, res) => {
    try {
        req.app.db.get("books").find({ id: req.params.id }).assign(req.body).write();

        res.send(req.app.db.get("books").find({ id: req.params.id }));
    } catch (error) {
        return res.status(500).send(error);
    }
});

router.delete("/:id", (req, res) => {
    req.app.db.get("books").remove({ id: req.params.id }).write();
     
    res.sendStatus(200);
});

module.exports = router;