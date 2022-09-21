require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

morgan.token('body', function(req, res) {
    return JSON.stringify(req.body);
});

app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())

/* adding a new entry to the phonebook */
app.post('/api/persons', (request, response, next) => {
    let person = request.body
    if(person.name === "" || person.number === ""){
        response.status(400).json({"error": "name or number cannot be empty"})
    }else{
        let newPerson = new Person({
            name: person.name,
            number: person.number
        })
        newPerson
        .save()
        .then(result => {
            console.log(`added ${newPerson} to the phonebook`)
            response.json(newPerson)
        })
        .catch(error => {
            next(error)
        })
    }
})

/* updating an existing entry to the phonebook */
app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
  
    const person = {
      content: body.content,
      important: body.important,
    }
    Person
    .findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query'})
    .then(updatedPerson => {
        response.json(updatedPerson)
    })
    .catch(error => {
        next(error)
    })
    
})

/* root route */
app.get('/', (request, response, next) => {
  response.send('<h1>Hello World!</h1>')
})

/* get all the entries of the database */
app.get('/api/persons', (request, response) => {
    Person
    .find({})
    .then(persons => {
        response.json(persons)
    })
    .catch(error => next(error))
})

/* info route */
app.get('/info', (request, response, next) => {
    Person.find({}).then(result => {
        let date = new Date()
        response.send(`<p>Phonebook has info for ${result.length} people</p> <p>${date}</p>`)
    })
    .catch(error => next(error))
})

/* handling get request for individual entries */
app.get('/api/persons/:id', (request, response, next) => {
    Person
    .findById(request.params.id)
    .then(person => {
        if(person){
            response.json(person)
        }else{
            response.status(404).end()
        }
    })
    .catch(error => next(error))
})

/* handling delete requests */
app.delete('/api/persons/:id', (request, response, next) => {
    Person
        .findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    next(error)
}

app.use(errorHandler)

/* defining port at which the app will be run */
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

