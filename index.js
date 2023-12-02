let staffs = []

let filteredStaffs = [...staffs]

const gender = {
    male: "мужской",
    female: "женский"
}

const rebuild = new Event('rebuild', {bubbles: true})

const config = {
    sort: null,
    page: 1,
    perPage: 10,
    url: 'https://api.slingacademy.com/v1/sample-data/users'
}

const getUrl = (page) => {
    const offset = (page * config.perPage) - config.perPage
    const url = new URL(config.url)
    url.searchParams.set('limit', config.perPage)
    url.searchParams.set('offset', offset.toString())

    return url
}

const loadUsers = async () => {
    const response = await fetch(getUrl(config.page))
    if (response.ok) {
        const json = await response.json()
        staffs = json.users
        return [...staffs]
    }
    return []
}

const toCurrency = (value) => {
    const options = {currency: 'RUB', style: 'currency'}
    return new Intl.NumberFormat('Ru-ru', options).format(value)
}

const newStaff = () => {
    const newStaff = {}

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

    if (!newStaff.id) {
        newStaff.id = Math.max(...staffs.map(staff => staff.id)) + 1
        staffs.push(newStaff)
    } else {
        newStaff.id = +newStaff.id
        const index = staffs.findIndex(staff => staff.id === newStaff.id)
        staffs[index] = newStaff
    }

    filteredStaffs = [...staffs]
    document.forms[0].reset()
    document.dispatchEvent(rebuild)
    closeModal()
}

const deleteStaff = (id) => {
    staffs.splice(staffs.findIndex(staff => staff.id === +id), 1)
    filteredStaffs = [...staffs]
    document.dispatchEvent(rebuild)
}

const renderRow = (staff) => {
    return `<tr role="button" tabindex="0" data-edit-id="${staff.id}">
        <th scope="row">${staff.id}</th>
        <td>${staff.last_name} ${staff.first_name}</td>
        <td>${new Date(staff.date_of_birth).toLocaleDateString()} г.</td>
        <td>${gender[staff.gender]}</td>
        <td>${staff.city}</td>
        <td>${staff.email}</td>
        <td>${staff.phone}</td>
        <td>
            <button type="button" class="btn-close delete-btn" data-bs-dismiss="modal" aria-label="Close" data-delete-id="${staff.id}"></button>
        </td>
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
        filteredStaffs = staffs.filter(staff => {
            const first_name_compare = staff.first_name.toLowerCase().includes(e.target.value.toLowerCase())
            const last_name_compare = staff.last_name.toLowerCase().includes(e.target.value.toLowerCase())
            const email_name_compare = staff.email.toLowerCase().includes(e.target.value.toLowerCase())
            const city_name_compare = staff.city.toLowerCase().includes(e.target.value.toLowerCase())
            return first_name_compare || last_name_compare || email_name_compare || city_name_compare
        })
    }
    document.dispatchEvent(rebuild)
})

document.querySelectorAll('[data-sort]').forEach(el => {
    el.addEventListener('click', (e) => {
        const key = e.target.dataset.sort
        filteredStaffs.sort((a, b) => {
            switch (key) {
                case 'name':
                    return config.sort === key
                        ? a.first_name.localeCompare(b.first_name) || a.last_name.localeCompare(b.last_name)
                        : b.first_name.localeCompare(a.first_name) || b.last_name.localeCompare(a.last_name)
                case 'date_of_birth':
                    return config.sort === key
                        ? new Date(b.date_of_birth) - new Date(a.date_of_birth)
                        : new Date(a.date_of_birth) - new Date(b.date_of_birth)
                default:
                    return config.sort === key
                        ? a[key].localeCompare(b[key])
                        : b[key].localeCompare(a.key)
            }
        })
        config.sort = config.sort === key ? null : key
        document.dispatchEvent(rebuild)
    })
})

document.addEventListener('rebuild', () => {
    tableBody.innerHTML = ''

    filteredStaffs.forEach(staff => {
        tableBody.insertAdjacentHTML('beforeend', renderRow(staff))
    })

    document.querySelectorAll('[data-edit-id]').forEach(el => {
        el.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.editId
            const staff = staffs.find(staff => staff.id === +id)

            modal.querySelector('#id').value = staff.id
            modal.querySelector('#staff-name').value = staff.name
            modal.querySelector('#staff-age').value = staff.age
            modal.querySelector(`#${staff.gender}`).checked = true
            modal.querySelector('#staff-salary').value = staff.salary
            modal.querySelector('#married').checked = staff.married
            modal.querySelector('#staff-skills').value = staff.skills.join('\r\n')
            modal.querySelector('#staff-date').value = new Date(staff.employment_at).toISOString().slice(0, 10)

            openModal()
        })
    })

    document.querySelectorAll('[data-delete-id]').forEach(el => {
        el.addEventListener('click', (e) => {
            deleteStaff(e.target.dataset.deleteId)
        })
    })
})

document.addEventListener('DOMContentLoaded', async () => {
    filteredStaffs = await loadUsers()
    document.dispatchEvent(rebuild)
})
