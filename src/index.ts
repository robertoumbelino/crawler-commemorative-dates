import * as Crawler from 'crawler'

import { client } from './db/prisma'

const months = [
  'janeiro',
  'fevereiro',
  'marco',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro'
]

const crawler = new Crawler()

const saveCommemorationsFromMonth = async (monthIndex = 0) => {
  const month = months[monthIndex]

  if (!month) return

  console.log(month)

  await new Promise(resolve => setTimeout(resolve, 2000))

  try {
    crawler.queue({
      url: `https://www.guialince.com.br/datas-comemorativas/${month}`,
      callback: async (error, res, done) => {
        if (error) {
          console.error(error)
          return
        }

        const $ = res.$
        const promises = $('table.table-hover > tbody > tr')
          .toArray()
          .map(async line => {
            const day = +$(line).find('td:nth-child(1)').text()
            const commemoration = $(line).find('td:nth-child(2)').text()

            const foundDate = await client.commemorativeDate.findFirst({
              where: {
                day,
                month: monthIndex + 1,
                title: commemoration
              }
            })

            if (foundDate) {
              console.log('Já existe', foundDate)
              return
            }

            const createdDate = await client.commemorativeDate.create({
              data: {
                day,
                month: monthIndex + 1,
                title: commemoration
              }
            })

            console.log(createdDate)
          })

        await Promise.all(promises)

        done()

        await saveCommemorationsFromMonth(monthIndex + 1)
      }
    })
  } catch ({ message }) {
    console.error(message)
  }
}

saveCommemorationsFromMonth()
