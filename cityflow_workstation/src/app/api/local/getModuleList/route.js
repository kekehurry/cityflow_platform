import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const GET = async (req) => {
  try {
    const moduleDir = path.join(process.cwd(), 'src/modules');

    const listDir = async (dir) => {
      const files = await fs.readdir(dir);
      const directories = [];
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
          directories.push(file);
        }
      }
      return directories;
    };

    const categoryList = (await listDir(moduleDir)).filter(
      (category) =>
        !(
          category === 'utils' ||
          (process.env.NODE_ENV === 'production' && category.startsWith('dev'))
        )
    );

    let moduleList = {};
    for (const category of categoryList) {
      const modules = (await listDir(path.join(moduleDir, category))).filter(
        (module) =>
          !(
            module === 'utils' ||
            (process.env.NODE_ENV === 'production' && module.startsWith('dev'))
          )
      );
      moduleList[category] = modules;
    }

    // console.log("Module List:", moduleList);
    return NextResponse.json({
      message: 'module list fetched successfully',
      moduleList,
    });
  } catch (error) {
    console.error('Error get module list:', error);
    return NextResponse.json(
      { error: 'Failed to get module list' },
      { status: 500 }
    );
  }
};
