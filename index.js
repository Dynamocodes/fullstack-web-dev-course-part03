require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')


const app = express()

const MAX_ID = 10000000;

let persons = 
[
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

const generateId = () => {
    return Math.floor(Math.random() *  MAX_ID)
}

morgan.token('body', function(req, res) {
    return JSON.stringify(req.body);
});

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())
app.use(express.static('build'))


const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } 
    next(error)
}

app.use(errorHandler)

app.post('/api/persons', (request, response) => {
  let person = request.body
  if(person.name === "" || person.number === ""){
    response.status(400).json({"error": "name or number cannot be empty"})
  }else{
    let newPerson = new Person({
        name: person.name,
        number: person.number
    })
    newPerson.save().then(result => {
        console.log(`added ${newPerson} to the phonebook`)
        response.json(newPerson)
    })
    /* loging the newly added entry of the phonebook for debug purposes */
    /* console.log(`${JSON.stringify(person)} was added to the phonebook`) */
    
  }
})

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    Person
    .find({})
    .then(persons => {
        response.json(persons)
    })
    .catch(error => next(error))
})

app.get('/info', (request, response) => {
    Person.find({}).then(result => {
        let date = new Date()
        response.send(`<p>Phonebook has info for ${result.length} people</p> <p>${date}</p>`)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response) => {
    Person
    .findById(Number(request.params.id))
    .then(person => {
        if(person){
            response.json(person)
        }else{
            response.status(404).end()
        }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person
        .findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})



const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})