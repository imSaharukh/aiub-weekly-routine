import { Injectable } from '@nestjs/common';
import { CourseDataModel, Day } from 'src/model/Coursedata';
import * as Handlebars from 'hbs'
import { Convert, RegisterableCourse, RegisterableSection } from 'src/model/data.model';
import { get, post } from "request-promise";
import * as path from 'path';
import * as fs from 'fs'
import * as puppeteer from 'puppeteer';
import { pdfDto } from './dtos/pdf.dtos';

@Injectable()
export class PdfService {


    async getPDF(id :string, pass : string){

        Handlebars.registerHelper("math", function(lvalue, operator, rvalue,) {
            lvalue = parseFloat(lvalue);
            rvalue = parseFloat(rvalue);
                
            return {
                "+": lvalue + rvalue,
                "-": lvalue - rvalue,
                "*": lvalue * rvalue,
                "/": lvalue / rvalue,
                "%": lvalue % rvalue
            }[operator];
        });
      console.log(id + ' ' +pass);
      const formData=  { UserName: id, Password: pass };
      console.log("form data" + formData);
      
      
          await post('https://portal.aiub.edu/Login', {
            followAllRedirects: true,
            jar: true, simple: false, form: formData
          });
      
          const b = await get('https://portal.aiub.edu/Student/Registration/GetPreReg', { jar: true });
      
      
      
          const courseData = Convert.toCourseData(b);
      
      
          const aa: RegisterableCourse[] = courseData.RegisterableCourses.filter(data => data.Status == "Registered");
          const bb: RegisterableSection[] = [];
      
          aa.forEach(data => {
            data.RegisterableSections.forEach(data2 => {
              if (data2.Registered) {
                console.log(`${data2.Description} ${data2.Title}`);
      
                bb.push(data2);
              }
            })
      
          });
      
          function itime(time:string) {
            const timeArray = time.split(':');
            // let timeStamp = parseInt(timeArray[0])*60 + parseInt(timeArray[1]);
          
            if (parseInt(timeArray[0]) >= 1 &&  parseInt(timeArray[0]) <= 5) {
              return (parseInt(timeArray[0]) + 12 ).toString() + ":" + timeArray[1];
            }
            return timeArray[0] + ":" + timeArray[1];
          }
          const sunday: Day[] = [];
          const monday : Day[] = [];
          const Tuesday : Day[] = [];
          const Wednesday : Day[] = [];
          bb.forEach(data => {
            const split = data.Routine.split(" ");
            console.log(split);
      
      
            if (split[0] == 'Sunday') {
              sunday.push({ name: data.Description, start: itime(split[1]), end: itime(split[4]) })
            } else if (split[9] == 'Sunday') {
              sunday.push({ name: data.Description, start: itime(split[10]), end: itime(split[13]) })
            } if (split[0] == 'Monday') {
              monday.push({ name: data.Description, start: itime(split[1]), end: itime(split[4]) })
            } else if (split[9] == 'Monday') {
              monday.push({ name: data.Description, start: itime(split[10]), end: itime(split[13]) })
            } if (split[0] == 'Tuesday') {
              Tuesday.push({ name: data.Description, start: itime(split[1]), end: itime(split[4]) })
            } else if (split[9] == 'Tuesday') {
              Tuesday.push({ name: data.Description, start: itime(split[10]), end: itime(split[13]) })
            } if (split[0] == 'Wednesday') {
              Wednesday.push({ name: data.Description, start: itime(split[1]), end: itime(split[4]) })
            } else if (split[9] == 'Wednesday') {
              Wednesday.push({ name: data.Description, start: itime(split[10]), end: itime(split[13]) })
            }
      
      
      
      
          });
      
          const finalData : CourseDataModel = { Sunday: sunday, Monday: monday, Tuesday: Tuesday, Wednesday: Wednesday,id: courseData.Student.StudentID}
      
          console.log(`final data `);
          console.log(finalData);
      
          // ejsLint('index', {data: finalData})
          return {data: finalData};
    }


    async genPDF(body : pdfDto){

     
      const browser = await puppeteer.launch({ headless: true ,args:["--ash-host-window-bounds=1920x1080", "--window-size=1920,1048", "--window-position=0,0","--no-sendbox"
           
    ],defaultViewport: null , });
   const page = await browser.newPage();

   await page.setViewport({
       width: 1920,
       height: 1080,
  
   });
   const url = `http://localhost:3000/pdf/get?id=${body.id}&pass=${body.pass}`;
   console.log(url);
   
   await page.goto(url, {waitUntil: 'networkidle2'});
  //  await page.waitForSelector('.cd-schedule__event');

   // await page.waitForSelector('.cd-schedule__events', {
   //     visible: true,
   // });

   // await page.setViewport({ width: 1366, height: 768});

   const buffer =   await page.pdf({ path: 'google.pdf',printBackground: true,width: '1900px' ,height: "1300px" });

   await browser.close();
  //  const pathfile = path.join(__dirname, '../../google.pdf');
  //  console.log(pathfile);
   
  //  return fs.createReadStream(pathfile);
  return buffer
    }
}
