const staffs = [
    {
        id: 1,
        name: "John",
        age: 30,
        gender: "male",
        salary: 5000,
        married: false,
        skills: ["html", "css", "js"],
        employment_at: "2020-01-01"
    },
    {
        id: 2,
        name: "Jane",
        age: 25,
        gender: "female",
        salary: 4000,
        married: true,
        skills: ["html", "css", "js", "php"],
        employment_at: "2023-06-21"
    },
    {
        id: 3,
        name: "Bob",
        age: 35,
        gender: "male",
        salary: 6000,
        married: false,
        skills: ["html", "css", "js", "python"],
        employment_at: "2021-03-15"
    },
    {
        id: 4,
        name: "Alice",
        age: 28,
        gender: "female",
        salary: 4500,
        married: true,
        skills: ["html", "css"],
        employment_at: "2022-09-01"
    },
    {
        id: 5,
        name: "Charlie",
        age: 40,
        gender: "male",
        salary: 7000,
        married: true,
        skills: ["html", "css", "js", "python", "java"],
        employment_at: "2020-07-10"
    },
    {
        id: 6,
        name: "Emily",
        age: 32,
        gender: "female",
        salary: 5000,
        married: true,
        skills: ["js", "C++"],
        employment_at: "2023-02-28"
    },
    {
        id: 7,
        name: "David",
        age: 29,
        gender: "male",
        salary: 5500,
        married: true,
        skills: ["html", "css", "js"],
        employment_at: "2021-11-05"
    },
    {
        id: 8,
        name: "Sophia",
        age: 27,
        gender: "female",
        salary: 4000,
        married: true,
        skills: ["html", "css", "js"],
        employment_at: "2022-08-15"
    }
]

const gender = {
    male: "мужской",
    female: "женский"
}

const rebuild = new Event('rebuild', {bubbles: true})

let filteredStaffs = [...staffs]

let sort = null

const toCurrency = (value) => {
    const options = {currency: 'RUB', style: 'currency'}
    return new Intl.NumberFormat('Ru-ru', options).format(value)
}

const newStaff = () => {
    const newStaff = {
        id: Math.max(...staffs.map(staff => staff.id)) + 1,
    }

    const formData = new FormData(document.forms[0])

    for (const key of formData.keys()) {
        newStaff[key] = null
        switch (key) {
            case 'skills':
                newStaff[key] = formData.get(key).split(/\r?\n/)
                break;
            case 'employment_at':
                newStaff[key] = new Date(formData.get(key))
                break
            default:
                newStaff[key] = formData.get(key)
        }
    }

    staffs.push(newStaff)
    document.forms[0].reset()
    document.dispatchEvent(rebuild)
    closeModal()
}

const renderRow = (staff) => {
    return `<tr data-id="${staff.id}">
        <th scope="row">${staff.id}</th>
        <td>${staff.name}</td>
        <td>${staff.skills.join(', ')}</td>
        <td>${new Date(staff.employment_at).toLocaleDateString()} г.</td>
        <td>${gender[staff.gender]}</td>
        <td>${staff.age}</td>
        <td>${toCurrency(staff.salary)}</td>
    </tr>`
}

const openModal = () => {
    modal.classList.add('show')
}

const closeModal = () => {
    modal.classList.remove('show')
}

const tableBody = document.querySelector('#table-body')
const modal = document.querySelector('#modal')
const filterInput = document.querySelector('#filter')

document.querySelector('.open-modal').addEventListener('click', openModal)
modal.querySelectorAll('.close-modal')
    .forEach(btn => btn.addEventListener('click', closeModal))

modal.querySelector('.save-modal').addEventListener('click', newStaff)

filterInput.addEventListener('input', (e) => {
    if (e.target.value === '') {
        filteredStaffs = [...staffs]
    } else {
        filteredStaffs = staffs.filter(staff => staff.name.toLowerCase().includes(e.target.value.toLowerCase()))
    }
    document.dispatchEvent(rebuild)
})

document.querySelectorAll('[data-sort]').forEach(el => {
    el.addEventListener('click', (e) => {
        const key = e.target.dataset.sort
        filteredStaffs.sort((a, b) => {
            switch (key) {
                case 'name':
                    return sort === key ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name)
                case 'age':
                case 'salary':
                    return sort === key ? b.age - a.age : a.age - b.age
                case 'employment_at':
                    return sort === key
                        ? new Date(b.employment_at) - new Date(a.employment_at)
                        : new Date(a.employment_at) - new Date(b.employment_at)
                default:
                    return 0

            }
        })
        sort = sort === key ? null : key
        document.dispatchEvent(rebuild)
    })
})

document.addEventListener('rebuild', () => {
    tableBody.innerHTML = ''

    filteredStaffs.forEach(staff => {
        tableBody.insertAdjacentHTML('beforeend', renderRow(staff))
    })
})

document.addEventListener('DOMContentLoaded', () => {
    document.dispatchEvent(rebuild)
})
