const users = [
    {
        id: 1,
        name: "John",
        age: 30,
        phone: "1234567890",
        city: "New York",
        skills: ["HTML", "CSS", "JavaScript", "GO"],
        employment_at: "2022-03-15"
    },
    {
        id: 2,
        name: "Jane",
        age: 25,
        phone: "0987654321",
        city: "Los Angeles",
        skills: ["Java", "C++"],
        employment_at: "2022-02-21"
    },
    {
        id: 3,
        name: "Bob",
        age: 40,
        phone: "9876543210",
        city: "Chicago",
        skills: ["C", "C++", "Python", "PHP"],
        employment_at: "2022-01-10"
    },
    {
        id: 4,
        name: "Alice",
        age: 35,
        phone: "4567890123",
        city: "Houston",
        skills: ["JavaScript", "Java", "Python"],
        employment_at: "2022-04-05"
    },
    {
        id: 5,
        name: "Mike",
        age: 28,
        phone: "7890123456",
        city: "San Francisco",
        skills: ["HTML", "CSS", "JavaScript", "Python"],
        employment_at: "2022-05-01"
    },
    {
        id: 6,
        name: "Emily",
        age: 32,
        phone: "2345678901",
        city: "Chicago",
        skills: ["C", "C++", "Java", "Python"],
        employment_at: "2022-06-15"
    },
    {
        id: 7,
        name: "David",
        age: 45,
        phone: "5678901234",
        city: "New York",
        skills: ["HTML", "CSS", "JavaScript", "Python"],
        employment_at: "2022-07-10"
    },
    {
        id: 8,
        name: "Sarah",
        age: 29,
        phone: "8901234567",
        city: "Los Angeles",
        skills: ["C", "C++", "Java", "Python"],
        employment_at: "2022-08-05"
    }
]

const app = document.querySelector('#app')

app.textContent = 'Users'
