const Database = require('better-sqlite3');

const express = require('express');
const router = express.Router({mergeParams: true});
const bodyParser = require('body-parser');
router.use(bodyParser.json());

const Delta = require('quill-delta');

// authentification middleware
router.use((req,res,next) => {
    try {
        req.db = new Database(`./data/${req.params.username}.sqlite3`, {fileMustExist: true});
        const auth = JSON.parse(atob(req.headers.auth));
        const stmt = req.db.prepare('SELECT id FROM auth WHERE username=@username AND password=@password');
        const id = stmt.pluck().get(auth);
        if (id === undefined) throw 'Wrong username / password combo.';
        else req.userId = id;
        next();
    }
    catch(e) {
        console.log('Failed to login', req.headers['x-forwarded-for'] || req.socket.remoteAddress);
        res.status(403).end();
    }
    finally {
        try {
            req.db.close();
        }
        catch {}
    }
});

// Root, used to test authentification.
router.get('/', (req,res) => {
    req.db.close();
    res.end()
});

// auth
router.get('/auth', (req,res) => {
    if (req.userId === 1) {
        let stmt = req.db.prepare('SELECT * FROM auth WHERE id>1');
        res.json(stmt.all());
    } else {
        res.status(403).end();
    }
    req.db.close();
});
router.put('/auth/:id', (req,res) => {
    if (req.userId === 1) {
        try {
            let stmt = req.db.prepare('UPDATE auth SET username=@username, password=@password, site=@site WHERE id=@id');
            res.json(stmt.run({id: req.params.id, ...{username, password, site} = req.body}));
        }
        catch {
            res.json({error: 'Could not edit connection with the values you entered.'});
        }
    } else {
        res.status(403).end();
    }
    req.db.close();
});
router.post('/auth', (req,res) => {
    if (req.userId === 1) {
        try {
            let stmt = req.db.prepare('INSERT INTO auth (username, password, site) VALUES (@username, @password, @site)');
            res.json(stmt.run(req.body));
        }
        catch {
            res.json({error: 'Could not add connection with the values you entered.'});
        }
    } else {
        res.status(403).end();
    }
    req.db.close();
});
router.delete('/auth/:id', (req,res) => {
    if (req.userId === 1) {
        let stmt = req.db.prepare('DELETE FROM auth WHERE id=@id');
        res.json(stmt.run(req.params));
    } else {
        res.status(403).end();
    }
    req.db.close();
});

// Get all categories and notes.
router.get('/categoriesAndNotes', (req,res) => {
    if (req.userId === 1) {
        var stmt = req.db.prepare('SELECT categories.id as categoryId, categories.name as categoryName, notes.id as noteId, notes.name as noteName, (SELECT group_concat(share.user) FROM share WHERE notes.id = share.note) as share FROM categories LEFT JOIN notes ON categories.id=notes.category ORDER BY categoryId');
        res.json(stmt.all());
    } else {
        var stmt = req.db.prepare('SELECT categories.id as categoryId, categories.name as categoryName, notes.id as noteId, notes.name as noteName FROM notes INNER JOIN share ON share.note = notes.id INNER JOIN categories ON categories.id=notes.category WHERE share.user=@userId ORDER BY categoryId');
        res.json(stmt.all({userId: req.userId}));
    }
    req.db.close();
});

// notes
router.get('/notes/:id/content', (req,res) => {
    if (req.userId === 1) {
        var stmt = req.db.prepare('SELECT content FROM notes WHERE id=@id');
        res.send(stmt.pluck().get(req.params));
    } else {
        var stmt = req.db.prepare('SELECT notes.content FROM notes INNER JOIN share ON share.note=notes.id WHERE notes.id=@id AND share.user=@userId');
        res.send(stmt.pluck().get({id: req.params.id, userId: req.userId}));
    }
    req.db.close();
});
router.put('/notes/:id', (req,res) => {
    if (req.userId === 1) {
        try {
            let stmt = req.db.prepare('UPDATE notes SET name=@name WHERE id=@id');
            stmt.run({id: req.params.id, name: req.body.name});
            let stmt2 = req.db.prepare('DELETE FROM share WHERE note=@id');
            stmt2.run(req.params);
            let stmt3 = req.db.prepare('INSERT INTO share (user, note) VALUES (@user, @note)');
            req.body.share.forEach(user => stmt3.run({user, note: req.params.id}));
            res.json('ok');
        } catch {
            res.json({error: 'Could not edit note. Please try again with a different name.'});
        }
    } else {
        res.status(403).end();
    }
    req.db.close();
});
router.put('/notes/:id/content', (req,res) => {
    if (req.userId === 1) {
        let stmt = req.db.prepare('SELECT content FROM notes WHERE id=@id');
        const content = new Delta(JSON.parse(stmt.pluck().get(req.params)));
        const diff = new Delta(req.body.diff);
        let stmt2 = req.db.prepare('UPDATE notes SET content=@content, modified=CURRENT_TIMESTAMP WHERE id=@id');
        const newContent = JSON.stringify(content.compose(diff));
        res.json(stmt2.run({id: req.params.id, content: newContent}));
    } else {
        res.status(403).end();
    }
    req.db.close();
});
router.post('/notes', (req,res) => {
    if (req.userId === 1) {
        try {
            stmt = req.db.prepare('INSERT INTO notes (category, name) VALUES (@category, @name)');
            res.json(stmt.run(req.body));
        }
        catch {
            res.json({error: 'Could not add note. Please try again with a different name.'})
        }
    } else {
        res.status(403).end();
    }
    req.db.close();
});

// categories
router.post('/categories', (req,res) => {
    if (req.userId === 1) {
        try {
            stmt = req.db.prepare('INSERT INTO categories (name) VALUES (@name)');
            res.json(stmt.run(req.body));
        }
        catch {
            res.json({error: 'Could not add category. Please try again with a different name.'})
        }
    } else {
        res.status(403).end();
    }
    req.db.close();
});

module.exports = router;