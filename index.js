const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

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

app.post('/api/persons', (request, response) => {
  let person = request.body
  if(person.name === "" || person.number === ""){
    response.status(400).json({"error": "name or number cannot be empty"})
  }else if(persons.filter(p => p.name === person.name).length !== 0){
    response.status(400).json({"error": `${person.name} is already used in the phonebook`})
  }else{
    person ={...person, "id": generateId()}
    persons.push(person) 
    /* loging the newly added entry of the phonebook for debug purposes */
    /* console.log(`${JSON.stringify(person)} was added to the phonebook`) */
    response.json(person)
  }
})

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/info', (request, response) => {
    let date = new Date()
    response.send(`<p>Phonebook has info for ${persons.length} people</p> <p>${date}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if(person){
        response.json(person)
    }else{
        response.status(404).end()
    }
})

  app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    let personToDelete = persons.find(person => person.id === id)
    if(personToDelete){
        persons = persons.filter(person => person.id !== id)
        response.status(204).end()
    }else{
        response.status(404).json({"error": "the entry has already been removed"})
    }
    
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})