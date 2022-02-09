// implement your posts router here
const express = require('express');
const Post = require('./posts-model');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const posts = await Post.find(req.query)
        res.json(posts)
    } catch(err) {
        res.status(500).json({ message: "The posts information could not be retrieved" })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const posts = await Post.findById(id)
        if (!posts) {
            res.status(404).json({ message: "The post with the specified ID does not exist" })
        } else {
            res.status(200).json(posts)
        }
    } catch(err) {
        res.status(500).json({ message: "The post information could not be retrieved" })
    }
})

router.post('/', (req, res) => {
    const { title, contents } = req.body
    if (!title || !contents) {
        res.status(400).json({ 
            message: "Please provide title and contents for the post" })
    } else {
        Post.insert({ title, contents })
        .then(({ id }) => {
            return Post.findById(id)
        })
        .then(post => {
            res.status(201).json(post)
        })
        .catch(err => {
            res.status(500).json({
                message: "There was an error while saving the post to the database",
                err: err.message,
                stack: err.stack
            })
        })
    }
})

router.put('/:id', (req, res) => {
    const { title, contents } = req.body
    if (!title || !contents) {
        res.status(400).json({ 
            message: "Please provide title and contents for the post" 
        })
    } else {
        Post.findById(req.params.id)
        .then(ids => {
            if (!ids) {
                res.status(404).json({
                    message: "The post with the specified ID does not exist"
                })
            } else {
                return Post.update(req.params.id, req.body)
            }
        })
        .then(data => {
            if (data) {
                return Post.findById(req.params.id)
            }
        })
        .then(post => {
            if (post) {
                res.json(post)
            }
        })
        .catch(err => {
            res.status(500).json({
                message: "The posts information could not be modified",
                err: err.message,
                stack: err.stack
            })
        })
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const deletePost = await Post.findById(id)
        if (!deletePost) {
            res.status(404).json({ message: "The post with the specified ID does not exist" })
        } else {
            await Post.remove(id)
            res.status(200).json(deletePost)
        }
    } catch(err) {
        res.status(500).json({ message: "The post could not be removed" })
    }
})

router.get('/:id/messages', async (req, res) => {
    try {
        const { id } = req.params
        const posts = await Post.findById(id)
        if (!posts) {
            res.status(404).json({ 
                message: "The post with the specified ID does not exist" 
            })
        } else {
            const messages = await Post.findPostComments(id)
            res.json(messages)
        }
    } catch(err) {
        res.status(500).json({
            message: "The comments information could not be retrieved",
            err: err.message,
            stack: err.stack
        })
    }
})

module.exports = router;