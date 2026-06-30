import { prisma } from 'lib/prisma'
import type { ArrayStorage, User } from 'generated/prisma/client'
import type { DragAndDropContainerArrayStorage } from './components/DragAndDropContainer'

export async function getAll(userId: Uint8Array<ArrayBuffer>) {
  try {
  const arrays = await prisma.arrayStorage.findMany({
    select: {
      id: true,
      name: true,
      items: true
    },
    where: {
      userId,
    },
    orderBy: {
       createdAt: "desc"
    }
  })
    const collection: { id: string, name: string, items: []}[] = [];
    arrays.map((array: any) => {
      // if (Object.keys(array.items).length > 0) {
            const bufferId = Buffer.from( array.id);
            const base64String = bufferId.toString('base64url');
        collection.push({ id: base64String, name: array.name, items: array.items });
      // }
    });
    return collection;
} catch (e: any) {
  console.log("Error fetching user arrays: ", e.message);
  return;
}
}

export async function getOne(id: string) {
  const bufferId = Buffer.from(id, 'base64url');
  return await prisma.arrayStorage.findFirst({
    where: {
      id: bufferId
    },
  });
}

export async function create(
  userId: Uint8Array<ArrayBuffer>,
  name: string,
  items: DragAndDropContainerArrayStorage
) {
  const newItem = {
    id: Bun.randomUUIDv7('buffer'),
    userId,
    name,
    items,
  } as any
  try {
    await prisma.arrayStorage.create({ data: newItem })
    const buffer = Buffer.from(newItem.id);
    const base64String = buffer.toString('base64url');
    return {
      success: true,
      id: base64String
    }
  } catch (e: any) {
    console.error('Error creating arrayStorage: ' + e.message)
    return {
      success: false,
    }
  }
}

export async function update(
  id: string,
  items: DragAndDropContainerArrayStorage
) {
  try {
    const bufferId = Buffer.from(id, 'base64url');
    await prisma.arrayStorage.update({
      where: {
        id: bufferId
      },
      data: {
        items: items as any,
      },
    })
    return {
      success: true,
    }
  } catch (e: any) {
    console.error('Error updating arrayStorage: ' + e.message)
    return {
      success: false,
    }
  }
}

export async function remove(id: string) {
  try {
    const bufferId = Buffer.from(id, 'base64url');
    await prisma.arrayStorage.delete({
      where: {
        id: bufferId
      },
    })
    return {
      success: true,
    }
  } catch (e: any) {
    console.error('Error creating arrayStorage: ' + e.message)
    return {
      success: false,
    }
  }
}
