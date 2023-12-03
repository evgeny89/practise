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
    lastPage: 1,
    url: 'https://api.slingacademy.com/v1/sample-data/users',
    crudUrl: 'https://jsonplaceholder.typicode.com/users',
}

const fieldsValidator = {
    id: /^[0-9]+$/,
    gender: /^male|female$/,
    first_name: /^[A-zА-яЁё]+$/,
    last_name: /^[A-zА-яЁё]+$/,
    email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
    phone: /^[0-9()\-+.x]+$/, //^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/,
    date_of_birth: /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$/,
    address: /^((?=.+[,|\r\n])){3,}[0-9A-zА-яЁё \s,.-]+$/,
}

const form = document.forms.user
const tableBody = document.querySelector('#table-body')
const modal = document.querySelector('#modal')
const filterInput = document.querySelector('#filter')
const toast = document.querySelector('#toast')

const getUrl = (page) => {
    const offset = (page * config.perPage) - config.perPage
    const url = new URL(config.url)
    url.searchParams.set('limit', config.perPage)
    url.searchParams.set('offset', offset.toString())

    return url
}

const showToast = (text) => {
    toast.querySelector('.toast-body').innerHTML = text
    toast.classList.add('show')
    setTimeout(() => {
        hideToast()
    }, 2000)
}

const makePagination = () => {
    const pages = [1]
    if (config.page > 4) {
        pages.push(config.page - 3)
    }
    if (config.page > 3) {
        pages.push(config.page - 2)
    }
    if (config.page > 2) {
        pages.push(config.page - 1)
    }
    if (config.page > 1) {
        pages.push(config.page)
    }
    if (config.lastPage - config.page > 2) {
        pages.push(config.page + 1)
    }
    if (config.lastPage - config.page > 3) {
        pages.push(config.page + 2)
    }
    if (config.lastPage - config.page > 4) {
        pages.push(config.page + 3)
    }
    if (config.lastPage - config.page > 0) {
        pages.push(config.lastPage)
    }

    return pages.reduce((pagination, page, index) => {
        if (index === pages.length - 1 && config.page < config.lastPage - 4) {
            pagination += '<span class="d-flex align-items-end px-2">...</span>'
        }
        pagination += `<li class="page-item"><button class="page-link ${page === config.page ? 'active' : ''}" data-page="${page}">${page}</button></li>`
        if (index === 0 && config.page > 4) {
            pagination += '<span class="d-flex align-items-end px-2">...</span>'
        }
        return pagination
    }, '')
}

const addListenersForPagination = () => {
    document.querySelectorAll('.page-link[data-page]')
        .forEach(page => {
            page.addEventListener('click', async (e) => {
                console.log(e.target.dataset.page)
                config.page = +e.target.dataset.page
                filteredStaffs = await loadUsers()
                document.dispatchEvent(rebuild)
            })
        })
}

const loadUsers = async () => {
    const response = await fetch(getUrl(config.page))
    if (response.ok) {
        const pagination = document.querySelector('.pagination')

        const json = await response.json()
        config.lastPage = Math.ceil(json.total_users / config.perPage)
        config.page = (json.offset + config.perPage) / config.perPage
        staffs = json.users

        pagination.innerHTML = ''
        pagination.insertAdjacentHTML('afterbegin', makePagination())
        addListenersForPagination()

        return [...staffs]
    }
    return []
}

const validate = (staff) => {
    let errors = false
    for (const [key, value] of Object.entries(staff)) {
        if (!fieldsValidator[key].test(value)) {
            errors = true
            const el = document.querySelector(`[name=${key}]`)
            el.classList.add('is-invalid')
        }
    }
    return errors
}

const newStaff = async () => {
    const newStaff = {}

    const formData = new FormData(form)

    for (const key of formData.keys()) {
        newStaff[key] = null
        switch (key) {
            case 'date_of_birth':
                newStaff[key] = !isNaN(new Date(formData.get(key)))
                    ? new Date(formData.get(key))?.toISOString()
                    : formData.get(key)
                break
            default:
                newStaff[key] = formData.get(key)
        }
    }

    if (validate(newStaff)) {
        return
    }

    if (!newStaff.id) {
        const response = await fetch(config.crudUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newStaff)
        })
        if (response.ok) {
            const json = await response.json()
            showToast(`${json.last_name} ${json.first_name} добавлен`)
        } else {
            showToast('Ошибка добавления')
        }
    } else {
        const response = await fetch(`${config.crudUrl}/${newStaff.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newStaff)
        })
        if (response.ok) {
            const json = await response.json()
            showToast(`${json.last_name} ${json.first_name} изменен`)
        } else {
            showToast('Ошибка изменения')
        }
    }

    form.reset()
    document.dispatchEvent(rebuild)
    closeModal()
}

const deleteStaff = async (id) => {
    const staff = staffs.find(staff => staff.id === +id)
    const response = await fetch(`${config.crudUrl}/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    })
    if (response.ok) {
        showToast(`${staff.last_name} ${staff.first_name} удален`)
    } else {
        showToast('Ошибка удаления')
    }
}

const renderRow = (staff) => {
    return `<tr role="button" tabindex="0" data-edit-id="${staff.id}">
        <th scope="row">${staff.id}</th>
        <td>
            ${staff.profile_picture ? `<img src="${staff.profile_picture}" class="rounded-circle" width="25" alt="${staff.last_name}">` : ''}
            <span class="link-primary">${staff.last_name} ${staff.first_name}</span>
        </td>
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

const hideToast = () => {
    toast.classList.remove('show')
    toast.querySelector('.toast-body').innerHTML = ''
}

const openModal = () => {
    modal.classList.add('show')
}

const closeModal = () => {
    modal.classList.remove('show')
    modal.querySelectorAll('.is-invalid')
        .forEach(el => el.classList.remove('is-invalid'))
}

form.addEventListener('input', function (event) {
    event.target.classList.remove('is-invalid')
});

document.querySelector('.open-modal').addEventListener('click', openModal)
modal.querySelectorAll('.close-modal')
    .forEach(btn => btn.addEventListener('click', closeModal))

modal.querySelector('.save-modal').addEventListener('click', newStaff)

filterInput.addEventListener('input', async (e) => {
    if (e.target.value === '') {
        filteredStaffs = [...staffs]
    } else {
        const url = new URL(config.url)
        url.searchParams.set('search', e.target.value)
        const response = await fetch(url)
        if (response.ok) {
            const json = await response.json()
            staffs = json.users
            filteredStaffs = [...staffs]
        }
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
            if (e.target.classList.contains('delete-btn')) {
                return
            }

            const id = e.currentTarget.dataset.editId
            const staff = staffs.find(staff => staff.id === +id)

            modal.querySelector('#id').value = staff.id
            modal.querySelector(`#${staff.gender}`).checked = true
            modal.querySelector('#first-name').value = staff.first_name
            modal.querySelector('#last-name').value = staff.last_name
            modal.querySelector('#email').value = staff.email
            modal.querySelector('#phone').value = staff.phone
            modal.querySelector('#date_of_birth').value = new Date(staff.date_of_birth).toISOString().slice(0, 10)
            modal.querySelector('#address').value = [staff.country, staff.state, staff.city, staff.street].join('\n')

            openModal()
        })
    })

    document.querySelectorAll('[data-delete-id]').forEach(el => {
        el.addEventListener('click', async (e) => {
            await deleteStaff(e.target.dataset.deleteId)
        })
    })
})

document.addEventListener('DOMContentLoaded', async () => {
    filteredStaffs = await loadUsers()
    document.dispatchEvent(rebuild)
})
