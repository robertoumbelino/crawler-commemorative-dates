import { client } from './db/prisma'

const run = async () => {
  try {
    // client.commemorativeDate.findMany().then(dates => console.log(dates))
    // const createdDate = await client.commemorativeDate.create({
    //   data: {
    //     day: 23,
    //     month: 9,
    //     title: 'Daleeee'
    //   }
    // })
    // console.log(createdDate)
  } catch ({ message }) {
    console.error(message)
  }
}

run()
