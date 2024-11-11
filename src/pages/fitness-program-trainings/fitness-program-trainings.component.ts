import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FitnessButtonComponent } from '../../components/fitness-button/fitness-button.component';
import { PRIMENG_COMPONENTS } from '../../core/library/primeng-index';
import { IExercise } from '../../core/model';
import { IExerciseTraining } from '../../core/model/interface/exerciseTraining';
import { ITrainingProgram } from '../../core/model/interface/trainingProgram';
import { ExerciseService } from '../../services/exercise/exercise.service';
import { ExercisesTrainingService } from '../../services/exercises-training/exercises-training.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PRIMENG_COMPONENTS,
    FitnessButtonComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './fitness-program-trainings.component.html',
  styleUrl: './fitness-program-trainings.component.scss',
})
export class FitnessProgramTrainingsComponent implements OnInit {
  titlecase: TitleCasePipe = new TitleCasePipe();
  trainingsForm!: FormGroup;
  programInfo: ITrainingProgram = {};
  training!: IExerciseTraining;

  trainingAddToProgram: IExerciseTraining[] = [];

  exercisesList: IExercise[] = [];
  filterExercise: IExercise[] = [];

  activeFilterMenu: number | null = null;
  activeSubmit: boolean = false;

  hideBtn: boolean = true;
  isEditable: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private exerciseService: ExerciseService,
    private exerciseTrainingService: ExercisesTrainingService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.programInfo = history.state;
    this.trainingsForm = this.formBuilder.group({
      exercises: this.formBuilder.array([this.createExercise()]),
    });
    console.log(this.programInfo);
  }

  /*   showConfirmDialog() {
    this.confirmationService.confirm({
      message: 'Are you sure?',
      accept: () => {},
      reject: () => {},
    });
  } */

  get exercises(): FormArray {
    return this.trainingsForm.get('exercises') as FormArray;
  }

  public createExercise(): FormGroup {
    return this.formBuilder.group({
      id_scheda: [this.programInfo.id || 11], //! to remove
      id_exercise: [],
      exercise: [''],
      reps: [],
      series: [],
      rest: [''],
      weight: [],
      weight_max_rm: [],
      video: [''],
    });
  }

  public addExercise() {
    this.exercises.push(this.createExercise());
    this._enableSubmitBtn();
    this.hideBtn = true;
  }

  public searchExercise(index: number) {
    this.activeFilterMenu = index;
    this.exerciseService.getExercises().subscribe({
      next: (exercises) => {
        this.exercisesList = exercises.map((exercise) => ({
          ...exercise,
          name: this.titlecase.transform(exercise.name.replaceAll('_', ' ')),
        }));
      },
      error: () => {},
    });
  }

  public onFilterExercise(key: string) {
    this.filterExercise = this.exercisesList.filter((exercise) =>
      exercise.name.toLowerCase().startsWith(key.toLowerCase())
    );
    if (!key) {
      this.filterExercise = [];
    }
  }

  public selectExercise(exercise: IExercise, index: number) {
    this.exercises.controls[index].patchValue({
      exercise: exercise.name,
      id_exercise: exercise.id,
    });
    this.filterExercise = [];
    this.activeFilterMenu = null;
  }

  public editExercise(index: number) {
    this.exercises.at(index).enable();
    this.hideBtn = true;
    this._enableSubmitBtn();
  }

  public saveExercise(index: number) {
    const exercise = this.exercises.at(index) as FormGroup;
    exercise.value.rest = exercise.value.rest.padStart(8, '00:');
    if (exercise.valid) {
      this.trainingAddToProgram.push(exercise.value);
      if (this.exercises.controls.length - 1 === index) {
        this.hideBtn = false;
      }
      exercise.disable();
    }
    this._enableSubmitBtn();
  }

  public deleteExercise(index: number) {
    this.trainingAddToProgram.splice(index, 1);
    if (this.exercises.length > 1) {
      return this.exercises.removeAt(index);
    }
    this.exercises.at(index).reset();
    this.exercises.at(index).enable();
    this.hideBtn = true;
    this._enableSubmitBtn();
  }

  public onSubmit() {
    this.trainingAddToProgram.forEach((training) => {
      this.exerciseTrainingService.createExerciseTraining(training).subscribe({
        next: (exercise: IExerciseTraining) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Program Trainings Build',
            detail: "Let's grow your muscles",
            life: 2500,
          });
        },
        error: () => {},
      });
    });
  }

  public redirect() {
    this.router.navigate([`program/${this.programInfo.id}`]);
  }

  private _enableSubmitBtn() {
    this.exercises.controls.forEach((c) => (this.activeSubmit = c.disabled));
  }
}