from multiprocessing import Process, Manager

manager = Manager()
shared_dict = manager.dict()

def display_shared_objects(dictionary):
    # Keep in mind that the dictionary is shared between processes, the subprocess does not have logging set up
    for material in dictionary:
        print('Material:', material)

    # Assuming `Materials` class has a method `to_dict` which returns a dictionary representation of all materials.
    # materials = Materials()
    # shared_dict.update(materials.to_dict())

