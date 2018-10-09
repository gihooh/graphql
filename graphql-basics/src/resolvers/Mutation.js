import uuidv4 from 'uuid/v4';

const Mutation = {
  createUser(parent, args, {db}, info) {
    const emailTaken = db.users.some(user => user.email === args.data.email)

    if (emailTaken) throw new Error('Email already taken.');
    
    const user = {
      id: uuidv4(),
      ...args.data
    };

    db.users.push(user);
    return user;
  },
  deleteUser(parent, args, {db}, info) {
    const userIndex = db.users.findIndex(user => user.id === args.id)

    if (userIndex === -1) {
      throw new Error('User not found.')
    }

    const deletedUser = db.users.splice(userIndex, 1)[0];

    db.posts = db.posts.filter((post) => {
      const match = post.author === args.id;

      if (match) {
        db.comments = db.comments.filter(comment => comment.post !== post.id)
      }

      return !match
    })

    db.comments = db.comments.filter(comment => comment.author === args.id)

    return deletedUser
  },
  updateUser(parent, {id, data}, {db}, info) {
    const user = db.users.find(user => user.id === id);
    
    if (!user) {
      throw new Error('User not found')
    }

    if (typeof data.email === 'string') {
      const emailTaken = db.users.some(user => user.email === data.email);

      if (emailTaken) {
        throw new Error('Email taken')
      }

      user.email = data.email
    }

    if (typeof data.name === 'string') {
      user.name = data.name
    }

    if (typeof data.age !== 'undefined') {
      user.age = data.age
    }

    return user
  },
  createPost(parent, args, {db}, info) {
    const userExists = db.users.some(user => user.id === args.data.author)

    if (!userExists) throw new Error('User does not exists.')

    const post = {
      id: uuidv4(),
      ...args.data
    }

    db.posts.push(post);

    return post
  },
  deletePost(parent, args, {db}, info) {
    const postIndex = db.posts.findIndex(post => post.id === args.id)

    if (postIndex === -1) {
      throw new Error('Post not found.')
    }

    const deletedPost = db.posts.splice(postIndex, 1)[0];

    db.comments = db.comments.filter(comment => comment.post === args.id)

    return deletedPost;
  },
  createComment(parent, args, {db}, info) {
    const userExists = db.users.some(user => user.id === args.data.author)
    const postExists = db.posts.some(post => post.id === args.data.post && post.published)

    if (!userExists || !postExists) throw new Error('Unable to find user and post.')

    const comment = {
      id: uuidv4(),
      ...args.data
    };

    db.comments.push(comment);

    return comment
  },
  deleteComment(parent, args, {db}, info) {
    const commentIndex = db.comments.findIndex(comment => comment.id === args.id)

    if(commentIndex === -1) {
      throw new Error('Comment does not exists.')
    }

    const deletedComment = db.comments.splice(commentIndex, 1)[0];

    return deletedComment;
  }
}

export {Mutation as default}