const books = [];
const RENDER_EVENT = 'render-book';

document.addEventListener('DOMContentLoaded', function () {
  const submitBook = document.getElementById('inputBook');
  submitBook.addEventListener('submit', function (e) {
    e.preventDefault();
    addBook();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const searchForm = document.getElementById('searchBook');
  searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    searchBooks();
  });
});

function addBook() {
  const bookTitle = document.getElementById('inputBookTitle').value;
  const bookAuthor = document.getElementById('inputBookAuthor').value;
  const bookYear = parseInt(document.getElementById('inputBookYear').value);
  const bookComplete = document.getElementById('inputBookIsComplete').checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    bookTitle,
    bookAuthor,
    bookYear,
    bookComplete
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();

  Swal.fire({
    position: 'center',
    icon: 'success',
    title: 'Buku sudah ditambahkan',
    showConfirmButton: false,
    timer: 1500,
  });
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

document.addEventListener(RENDER_EVENT, function () {
  const unreadBookList = document.getElementById('unreadBookList');
  const readedBookList = document.getElementById('readedBookList');

  unreadBookList.innerHTML = '';
  readedBookList.innerHTML = '';

  for (const bookItem of books) {
    const bookElement = showBook(bookItem);
    if (bookItem.isComplete) {
      readedBookList.appendChild(bookElement);
    } else {
      unreadBookList.appendChild(bookElement);
    }
  }
});

function searchBooks() {
  const searchTitle = document
    .getElementById('searchBookTitle')
    .value.toLowerCase();
  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTitle)
  );
  if (filteredBooks.length === 0) {
    Swal.fire({
      position: 'center',
      icon: 'error',
      title: 'Buku tidak ditemukan',
      showConfirmButton: false,
      timer: 1500,
    });
  }
  renderBooks(filteredBooks);
}

function renderBooks(booksToRender) {
  const unreadBookList = document.getElementById('unreadBookList');
  const readedBookList = document.getElementById('readedBookList');

  unreadBookList.innerHTML = '';
  readedBookList.innerHTML = '';

  for (const bookItem of booksToRender) {
    const bookElement = showBook(bookItem);
    if (bookItem.isComplete) {
      readedBookList.appendChild(bookElement);
    } else {
      unreadBookList.appendChild(bookElement);
    }
  }
}

function showBook(bookObject) {
  const makeTitle = document.createElement('h2');
  makeTitle.innerText = `Judul : ${bookObject.title}`;

  const makeAuthor = document.createElement('p');
  makeAuthor.innerText = `Author : ${bookObject.author}`;

  const makeYear = document.createElement('p');
  makeYear.innerText = `Year : ${bookObject.year}`;

  const makeContainer = document.createElement('div');
  makeContainer.classList.add('inner');
  makeContainer.append(makeTitle, makeAuthor, makeYear);

  const container = document.createElement('div');
  container.classList.add('item', 'shadow');
  container.append(makeContainer);
  container.setAttribute('id', `book-${bookObject.id}`);

  if (bookObject.isComplete) {
    const undoButton = document.createElement('button');
    undoButton.classList.add('undo-button');
    undoButton.innerText = 'Belum Dibaca';

    undoButton.addEventListener('click', function () {
      toggleReadStatus(bookObject.id);
    });

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-button');
    deleteButton.innerText = 'Hapus';

    deleteButton.addEventListener('click', function () {
      Swal.fire({
        title: 'Kamu yakin?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, Hapus!',
      }).then((result) => {
        if (result.isConfirmed) {
          removeBook(bookObject.id);
          Swal.fire('Dihapus!', 'Buku sudah dihapus.');
        }
      });
    });

    container.append(undoButton, deleteButton);
    saveData();
  } else {
    const checkButton = document.createElement('button');
    checkButton.classList.add('check-button');
    checkButton.innerText = 'Selesai Dibaca';

    checkButton.addEventListener('click', function () {
      toggleReadStatus(bookObject.id);
    });

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-button');
    deleteButton.innerText = 'Hapus';

    deleteButton.addEventListener('click', function () {
      Swal.fire({
        title: 'Kamu yakin?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, Hapus!',
      }).then((result) => {
        if (result.isConfirmed) {
          removeBook(bookObject.id);
          Swal.fire('Dihapus!', 'Buku sudah dihapus.');
        }
      });
    });

    container.append(checkButton, deleteButton);
    saveData();
  }

  return container;
}

function toggleReadStatus(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget != null) {
    bookTarget.isComplete = !bookTarget.isComplete;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }
}

function removeBook(bookId) {
  const bookIndex = books.findIndex((book) => book.id === bookId);
  if (bookIndex !== -1) {
    books.splice(bookIndex, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }
}

function findBook(bookId) {
  return books.find((book) => book.id === bookId);
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APP';

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializeData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializeData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}
