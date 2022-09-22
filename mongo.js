const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://phonebook:${password}@cluster0.givzdhk.mongodb.net/phonebookApp?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

const addPerson = (fullname, number) => {
  const person = new Person({
    name: fullname,
    number: number,
  })
  return person.save()
}

const getAllPeople = () => {
  return Person.find({})
}

mongoose
  .connect(url)
  .then(() => {
    console.log('connected')
    if(process.argv.length === 3) {
      getAllPeople()
        .then(result => {
          console.log('phonebook')
          result.forEach(person => {
            console.log(`${person.name} ${person.number}`)
          })
          return mongoose.connection.close()
        })
    }else if(process.argv.length === 5){
      let fullname = process.argv[3]
      let number = process.argv[4]
      addPerson(fullname, number)
        .then(() => {
          console.log(`added ${fullname} number ${number} to phonebook`)
          return mongoose.connection.close()
        })
    }else{
      console.log('Invalid number of arguments')
      process.exit(1)
    }
  })
  .catch((err) => console.log(err))
